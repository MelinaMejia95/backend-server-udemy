var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hostpital');

//Obtener todos los hospitales
app.get('/', (req, res, next) => {

    Hospital.find({},'nombre img usuario')
            .exec(
            (err, hospitales) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
    });
  
});

//Actualizar hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if( !hospital ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { mensaje: 'No existe un hospital con ese id' }
            }); 
        }

        hospital.nombre = body.nombre;
        hospital.usuario = body.usuario;

        hospital.save( (err, hospitalGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});

//Crear hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: body.usuario
    }); 
    
    hospital.save( (err, hospitalGuardado) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario 
        });
    });

});

//Eliminar hospital
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id

    Hospital.findByIdAndRemove( id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el hospital',
                errors: err
            });
        }

        if(!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });

});

module.exports = app;