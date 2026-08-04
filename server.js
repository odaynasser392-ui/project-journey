const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { all, get, run } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const root = path.join(__dirname, '..');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'project-journey-local-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use('/uploads', express.static(path.join(root, 'uploads')));
app.use(express.static(path.join(root, 'public')));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(root, 'uploads', 'evidence')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const requireUser = (req, res, next) => req.session.user ? next() : res.status(401).json({ error: 'AUTH_REQUIRED' });
const requireAdmin = (req, res, next) => req.session.user?.role === 'admin' ? next() : res.status(403).json({ error: 'ADMIN_REQUIRED' });

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, language = 'ar' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });
    const existing = await get('SELECT id FROM users WHERE email=?', [email.trim().toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'EMAIL_EXISTS' });
    const hash = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users(name,email,password_hash,language) VALUES(?,?,?,?)', [name.trim(), email.trim().toLowerCase(), hash, language]);
    const user = { id: result.id, name: name.trim(), email: email.trim().toLowerCase(), role: 'user', language };
    req.session.user = user;
    res.json({ user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await get('SELECT * FROM users WHERE email=?', [String(req.body.email || '').trim().toLowerCase()]);
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash))) return res.status(401).json({ error: 'INVALID_LOGIN' });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, language: user.language, avatar: user.avatar };
    res.json({ user: req.session.user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/auth/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get('/api/auth/me', (req, res) => res.json({ user: req.session.user || null }));

app.get('/api/dashboard', requireUser, async (req, res) => {
  const uid = req.session.user.id;
  const [projects, tasks, notifications, posts, stories] = await Promise.all([
    all('SELECT * FROM projects WHERE user_id=? ORDER BY updated_at DESC', [uid]),
    all('SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC', [uid]),
    all('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10', [uid]),
    all('SELECT posts.*, users.name FROM posts JOIN users ON users.id=posts.user_id ORDER BY posts.created_at DESC LIMIT 8'),
    all("SELECT stories.*, users.name FROM stories JOIN users ON users.id=stories.user_id WHERE stories.status='approved' ORDER BY stories.created_at DESC LIMIT 6")
  ]);
  res.json({ projects, tasks, notifications, posts, stories });
});

app.get('/api/projects', requireUser, async (req, res) => res.json(await all('SELECT * FROM projects WHERE user_id=? ORDER BY updated_at DESC', [req.session.user.id])));
app.post('/api/projects', requireUser, async (req, res) => {
  const { name, description, field = '', budget = 0, goal = '' } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'MISSING_FIELDS' });
  const result = await run('INSERT INTO projects(user_id,name,description,field,budget,goal) VALUES(?,?,?,?,?,?)', [req.session.user.id, name, description, field, Number(budget) || 0, goal]);
  res.json(await get('SELECT * FROM projects WHERE id=?', [result.id]));
});
app.get('/api/projects/:id', requireUser, async (req, res) => {
  const project = await get('SELECT * FROM projects WHERE id=? AND user_id=?', [req.params.id, req.session.user.id]);
  if (!project) return res.status(404).json({ error: 'NOT_FOUND' });
  project.tasks = await all('SELECT * FROM tasks WHERE project_id=? ORDER BY created_at DESC', [project.id]);
  res.json(project);
});
app.put('/api/projects/:id', requireUser, async (req, res) => {
  const { name, description, field, budget, goal, status, progress } = req.body;
  await run(`UPDATE projects SET name=?,description=?,field=?,budget=?,goal=?,status=?,progress=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`,
    [name, description, field || '', Number(budget)||0, goal||'', status||'idea', Math.max(0,Math.min(100,Number(progress)||0)), req.params.id, req.session.user.id]);
  res.json(await get('SELECT * FROM projects WHERE id=? AND user_id=?', [req.params.id, req.session.user.id]));
});
app.post('/api/projects/:id/tasks', requireUser, async (req, res) => {
  const project = await get('SELECT id FROM projects WHERE id=? AND user_id=?', [req.params.id, req.session.user.id]);
  if (!project) return res.status(404).json({ error: 'NOT_FOUND' });
  const r = await run('INSERT INTO tasks(project_id,user_id,title,due_date,state) VALUES(?,?,?,?,?)', [project.id, req.session.user.id, req.body.title, req.body.due_date||'', req.body.state||'current']);
  res.json(await get('SELECT * FROM tasks WHERE id=?', [r.id]));
});

app.get('/api/stories', async (_req, res) => res.json(await all("SELECT stories.id,stories.title,stories.summary,stories.content,stories.created_at,users.name FROM stories JOIN users ON users.id=stories.user_id WHERE stories.status='approved' ORDER BY stories.created_at DESC")));
app.get('/api/stories/:id', async (req, res) => {
  const row = await get("SELECT stories.*,users.name FROM stories JOIN users ON users.id=stories.user_id WHERE stories.id=? AND stories.status='approved'", [req.params.id]);
  row ? res.json(row) : res.status(404).json({ error: 'NOT_FOUND' });
});
app.post('/api/stories', requireUser, upload.single('evidence'), async (req, res) => {
  const { title, summary, content } = req.body;
  if (!title || !summary || !content || !req.file) return res.status(400).json({ error: 'STORY_AND_EVIDENCE_REQUIRED' });
  const r = await run('INSERT INTO stories(user_id,title,summary,content,evidence_path) VALUES(?,?,?,?,?)', [req.session.user.id,title,summary,content,`/uploads/evidence/${req.file.filename}`]);
  await run('INSERT INTO notifications(user_id,type,text) VALUES(?,?,?)', [req.session.user.id,'system','تم إرسال قصتك للمراجعة.']);
  res.json({ id: r.id, status: 'pending' });
});

app.get('/api/community/posts', async (_req,res)=>res.json(await all('SELECT posts.*,users.name FROM posts JOIN users ON users.id=posts.user_id ORDER BY posts.created_at DESC')));
app.post('/api/community/posts', requireUser, async (req,res)=>{
  if(!String(req.body.content||'').trim()) return res.status(400).json({error:'EMPTY_POST'});
  const r=await run('INSERT INTO posts(user_id,content) VALUES(?,?)',[req.session.user.id,req.body.content.trim()]);
  res.json(await get('SELECT posts.*,users.name FROM posts JOIN users ON users.id=posts.user_id WHERE posts.id=?',[r.id]));
});
app.get('/api/users', requireUser, async (req,res)=>res.json(await all('SELECT id,name,avatar FROM users WHERE id<>? ORDER BY name',[req.session.user.id])));
app.get('/api/messages/:userId', requireUser, async (req,res)=>res.json(await all(`SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY created_at`,[req.session.user.id,req.params.userId,req.params.userId,req.session.user.id])));
app.post('/api/messages/:userId', requireUser, async (req,res)=>{
  const body=String(req.body.body||'').trim(); if(!body) return res.status(400).json({error:'EMPTY_MESSAGE'});
  const r=await run('INSERT INTO messages(sender_id,receiver_id,body) VALUES(?,?,?)',[req.session.user.id,req.params.userId,body]);
  await run('INSERT INTO notifications(user_id,type,text) VALUES(?,?,?)',[req.params.userId,'community',`رسالة جديدة من ${req.session.user.name}`]);
  res.json(await get('SELECT * FROM messages WHERE id=?',[r.id]));
});

app.post('/api/ai/analyze', requireUser, async (req,res)=>{
  const text=String(req.body.text||'').trim();
  if(!text) return res.status(400).json({error:'EMPTY_TEXT'});
  const words=text.split(/\s+/).filter(Boolean);
  const hasMarket=/سوق|عميل|customer|market|mercado|cliente/i.test(text);
  const hasFinance=/ميزانية|تكلفة|دخل|budget|cost|finance|presupuesto|costo/i.test(text);
  const hasRisk=/مخاطر|خطر|risk|riesgo/i.test(text);
  res.json({
    source:'local-evidence-based',
    summary: words.slice(0,40).join(' ') + (words.length>40?'…':''),
    findings:[
      hasMarket?'تم ذكر السوق أو العملاء.':'يحتاج النص إلى توضيح السوق والعملاء المستهدفين.',
      hasFinance?'تم ذكر جانب مالي.':'يحتاج النص إلى ميزانية وتكاليف ومصادر دخل.',
      hasRisk?'تم ذكر المخاطر.':'يحتاج النص إلى تحديد المخاطر وخطة تقليلها.'
    ],
    note:'التحليل مبني فقط على النص المدخل ولا يضيف حقائق غير موجودة.'
  });
});

app.get('/api/admin/overview', requireAdmin, async (_req,res)=>{
  const counts={};
  for(const t of ['users','projects','stories','posts','messages']) counts[t]=(await get(`SELECT COUNT(*) count FROM ${t}`)).count;
  const pending=await all("SELECT stories.*,users.name FROM stories JOIN users ON users.id=stories.user_id WHERE stories.status='pending' ORDER BY stories.created_at");
  res.json({counts,pending});
});
app.put('/api/admin/stories/:id', requireAdmin, async (req,res)=>{
  const status=['approved','rejected'].includes(req.body.status)?req.body.status:'pending';
  const story=await get('SELECT * FROM stories WHERE id=?',[req.params.id]); if(!story) return res.status(404).json({error:'NOT_FOUND'});
  await run('UPDATE stories SET status=?,admin_note=? WHERE id=?',[status,req.body.admin_note||'',story.id]);
  await run('INSERT INTO notifications(user_id,type,text) VALUES(?,?,?)',[story.user_id,'system',status==='approved'?'تم اعتماد قصتك.':'تم رفض القصة. راجع ملاحظة المشرف.']);
  res.json({ok:true});
});

app.get('*', (req,res)=>{
  const requested=path.join(root,'public',req.path.replace(/^\//,''));
  if(fs.existsSync(requested) && fs.statSync(requested).isFile()) return res.sendFile(requested);
  res.sendFile(path.join(root,'public','index.html'));
});
app.listen(PORT,()=>console.log(`Project Journey: http://localhost:${PORT}`));
