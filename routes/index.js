'use strict';

const { Router } = require('express');
const router = Router();

router.get('/', (req, res, next) => {
	res.render('index', { title: 'Hello Mundo!' });
});

module.exports = router;
