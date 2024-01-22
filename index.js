'use strict';

const path = require('path');
const express = require('express');

const app = express();

const {
    port,
    host,
    storageEngine,
    storage
} = require('./config');

const storageEnginePath = path.join(__dirname, storageEngine.folder);

const dataStoragePath = path.join(storageEnginePath, storageEngine.dataStorageFile);

const storagePath = path.join(__dirname, storage.folder);
const { createDataStorage } = require(dataStoragePath);

const dataStorage = createDataStorage(storagePath, storage.storageConfigFile);

/* dataStorage.getAll().then(console.log); */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pageViews'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));

const menuPath = path.join(__dirname, 'menu.html');

app.get('/', (req, res) => { res.sendFile(menuPath) });

app.get('/all', (req, res) => 
    dataStorage.getAll().then(data =>
        res.render('allPersons', { 
        title: 'Persons',
        header: 'All persons',
        result: data 
    })));

    app.post('/search', async (req, res) => {
        if(!req.body) return res.sendStatus(500);
        const key = req.body.key;
        const value = req.body.searchvalue;
        const  persons = await dataStorage.get(value, key);
        res.render('allPersons', { 
            title: 'Search',
            header: 'Found persons',
            result: persons 
        });
    });

app.get('/search', (req, res) => dataStorage.KEYS.then(keys => res.render('search', {keys})));

app.get('/inputform', (req, res) => res.render('form', {
    title: 'Add person',
    header: 'Add a new person',
    action: '/input',
    id: {value: '', readonly: ''},
    firstname: {value: '', readonly: ''},
    lastname: {value: '', readonly: ''},
    department: {value: '', readonly: ''},
    salary: {value: '', readonly: ''}
}));

app.post('/input', (req, res) => {
    if(!req.body) return res.sendStatus(500);

    dataStorage.insert(req.body)
    .then(state => sendStatusPage(res, state))
    .catch(err => sendErrorPage(res, err));
});

app.get('/removeperson', (req, res) => res.render('getPerson', {
    title: 'Remove',
    header: 'Remove person data',
    action: '/removeperson'
}));

app.listen(port, host, () => { console.log(`Server is running on http://${host}:${port} serving...`);});

function sendStatusPage(res, status, title='Status', header='Status') {
    return res.render('statusPage', {
        title,
        header,
        status
    });
}

function sendErrorPage(res, err, title='Error', header='Error') {
    sendStatusPage(res, err, title, header);
}