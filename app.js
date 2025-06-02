const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./userModel');
const fs=require('fs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Home page - form to create user
app.get('/', (req, res) => {
  res.render('index');
});

// Create user route
app.post('/create', async (req, res) => {
  const { name, contact, email, image } = req.body;
  await userModel.create({ name, contact, email, image });
  const users = await userModel.find();
  res.render('read', { users });
});

// Read all users
app.get('/read', async (req, res) => {
  const users = await userModel.find();
  res.render('read', { users });
});

// Delete user by ID
app.get('/delete/:id', async (req, res) => {
  await userModel.findByIdAndDelete(req.params.id);  
  res.redirect('/read');
});
app.get('/edit/:id', async (req, res) => {
  const user = await userModel.findById(req.params.id);
  res.render('edit', { user });
});

app.post('/edit/:id', async (req, res) => {
  const { name, contact, email, image } = req.body;
  await userModel.findByIdAndUpdate(req.params.id, {
    name,
    contact,
    email,
    image
  });
  res.redirect('/read');
});

app.get('/new',(req,res)=>{
    fs.readdir(`./files`,(err,files)=>{
        console.log(files);
        res.render("newshow",{files:files});
    }) 
})

app.get('/file/:filename',(req,res)=>{
    fs.readFile(`./files/${req.params.filename}`,'utf-8',(err,filedata)=>{
        res.render("blog",{filename:req.params.filename, filedata:filedata})
    })
})
app.post('/new/create',(req,res)=>{
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}.txt`,req.body.content,(err)=>{
        res.redirect('/new')
    })
})
// Edit form
app.get('/newedit/:filename', (req, res) => {
  fs.readFile(`./files/${req.params.filename}`, 'utf-8', (err, data) => {
    if (err) return res.send("Error loading file");
    res.render('newedit', { filename: req.params.filename, content: data });
  });
});
// Handle edit form submission
app.post('/newedit/:filename', (req, res) => {
  const oldName = req.params.filename;
  const newName = req.body.title.split(' ').join('') + '.txt';

  // Rename file if title changed
  fs.rename(`./files/${oldName}`, `./files/${newName}`, (err) => {
    if (err) return res.send("Rename failed");

    fs.writeFile(`./files/${newName}`, req.body.content, (err) => {
      if (err) return res.send("Write failed");
      res.redirect('/new');
    });
  });
});
// Delete
app.post('/delete/:filename', (req, res) => {
  fs.unlink(`./files/${req.params.filename}`, (err) => {
    if (err) return res.send("Delete failed");
    res.redirect('/new');
  });
});
app.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
});
