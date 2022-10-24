const router = require('express').Router();

const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

const { validationCreateMovie, validationDeleteMovie } = require('../middlewares/validations');

router.get('/movies', getMovies);
router.post('/movies', validationCreateMovie, createMovie);
router.delete('/movies/:movieId', validationDeleteMovie, deleteMovie);

module.exports = router;
