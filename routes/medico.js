var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//Obtener todos los médicos
app.get('/', (req, res) => {

    Medico.find({}, 'nombre usuario hospital')
        .exec(
            (err, medicos) => {
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar médicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true, 
                    medico: medicos
                });
        });

});

//Actualizar médico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
        
    });

});

//Crear médico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: body.usuario,
        hospital: body.hospital,
        img: body.img
    });

    medico.save( (err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        }); 
    });

});

//Eliminar médico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove( id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar médico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;