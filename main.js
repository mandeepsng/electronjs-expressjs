const { app, BrowserWindow, Menu } = require('electron');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const handlebars = require('hbs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const pdf = require('html-pdf');
const csv = require('csv-parser');
const upload = multer({ dest: 'uploads/' }).single('csv');





let mainWindow;
let aboutWindow;

const menuTemplate = [  {    label: 'File',    submenu: [      { role: 'quit' }    ]
  },
  {
    label: 'About',
    click: () => {
      // Create a new window when "About" is clicked
      createAboutWindow()
    }
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)




function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: 700,
    height: 450,
    webPreferences: {
      nodeIntegration: true
    }
  })

  aboutWindow.loadFile('about.html')
}


function createWindow() {
  mainWindow = new BrowserWindow(
    { 
        width: 700,
        height: 450
    });

    // open dev tools
    // mainWindow.webContents.openDevTools()

  mainWindow.loadURL('http://localhost:3005');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  const expressApp = express();

//   expressApp.use('/public', express.static(path.join(__dirname, 'public')));

// expressApp.use(express.static(__dirname + '/public'));

expressApp.use(express.static(path.join(__dirname, 'public')));




  expressApp.set('view engine', 'hbs');
  expressApp.set('views', path.join(__dirname, 'views'));

  expressApp.use(bodyParser.urlencoded({ extended: true }));



  expressApp.post('/createFiledd', upload, (req, res) => {
    const name = req.body.name;
    const csvFile = req.file;
  
    console.log(`Creating file: ${csvFile.path}`);
  
    // Add code here to create the file using the uploaded CSV file
    // The CSV file will be available at `csvFile.path`
  
    res.send(`File created: ${name}`);
  });

  expressApp.get('/home', (req, res) => {
    res.redirect('/');
  });


  expressApp.post('/', upload, (req, res) => {

    const file = req.file;
    if (!file) {
      return res.render('index', { error: 'No CSV file was uploaded!' });
    }
    if (!['text/csv', 'application/csv'].includes(file.mimetype)) {
      return res.render('index', { error: 'Only CSV files are allowed!' });
    }
  
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv({ headers: true }))
      // .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(req.file.path); // delete the file after reading it
        results.forEach((row, index) => {
          if(index > 0){
            console.log(row._0);
          }
        });
  
        const resultsJSON = JSON.stringify(results);
  
        res.render('index', { results: resultsJSON});
  
      });
  });


  expressApp.post('/createFile', upload, (req, res) => {

    const file = req.file;
    if (!file) {
      return res.render('index', { error: 'No CSV file was uploaded!' });
    }
    if (!['text/csv', 'application/csv'].includes(file.mimetype)) {
      return res.render('index', { error: 'Only CSV files are allowed!' });
    }
  
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv({ headers: true }))
      // .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(req.file.path); // delete the file after reading it
        results.forEach((row, index) => {
          if(index > 0){
          }
        });
  
        const resultsJSON = JSON.stringify(results);

        res.render('index', { results: resultsJSON});

  
      });
  });


  expressApp.post('/create-html', function(req, res) {
    // Render the Handlebars template with the data
    const dd = req.body.data;
    const id = req.body.id;
    const headers = req.body.headers;
    const data =  {
      data: dd,
      headers: headers,
      image_url: 'http://localhost:3005/logo.png',
    };
  
  
    
    console.log(data._0)
    // res.send(data);
    
    // const template = fs.readFileSync('template.ejs', 'utf-8');

    const templatePath = path.join(__dirname, 'template.ejs');

    const template = fs.readFileSync(templatePath, 'utf-8');
    
    const html = ejs.render(template, data);
    
    // res.send(html)
    
    var EmployeName = dd._0
    EmployeName = createSlug(EmployeName)
    var pdfFileName = `${downloadDir}/${folderName}/${EmployeName}.pdf`
  
    // const filePath = 'render.html';
    const filePath = path.join(__dirname, 'render.html');
  fs.writeFile(filePath, html, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`File "${filePath}" written successfully`);
    }
  });
  
  const options = {
      format: 'Letter',
      border: {
        top: '1px',
        right: '1px',
        bottom: '1px',
        left: '1px'
      },
      footer: {
        height: '15mm',
        
      }
    };
  
  pdf.create(html, options).toFile(pdfFileName, (err, res) => {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
  
  res.send({
    'pdfFileName' : pdfFileName,
    'id' : id,
  })
  
  });


  expressApp.get('/', (req, res) => {
    const data = {
        message: 'Hello from Express!'
      };
    
      res.render('index', data);
  });

  expressApp.get('/', (req, res) => {
    const data = {
      message: 'Hello from Express!'
    };
  
    res.render('index', data);
  });
  
  expressApp.get('/about', (req, res) => {
    res.render('about');
  });
  
  expressApp.get('/contact', (req, res) => {
    res.render('contact');
  });


  function createSlug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
  
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
             .replace(/\s+/g, '-') // collapse whitespace and replace by -
             .replace(/-+/g, '-'); // collapse dashes
  
    return str;
  }


  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // add leading zero if necessary
  const day = String(date.getDate()).padStart(2, '0'); // add leading zero if necessary

  const folderName = `${year}-${month}-${day}`;
  const downloadDir = app.getPath('downloads');

  console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
  
  fs.mkdir(`${downloadDir}/${folderName}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
    }
  });

  expressApp.listen(3005, () => {
    console.log('Express server running on port 3005');
    createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
