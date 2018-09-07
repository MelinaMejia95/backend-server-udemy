var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf(tipo) < 0) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'Tipo colección no es válida',
            errors: { message: 'Tipo colección no es válida'}
        });
    }

    if ( !req.files ) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen'}
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[ nombreCortado.length -1 ];

    //Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'Png'];

    if( extensionesValidas.indexOf(extension) < 0 ) {
        return  res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;
    
    //Mover archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`

    archivo.mv( path, err => {
        if(err) {
            return  res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

    });

});

function subirPorTipo( tipo, id, nombreArchivo, res ) {
    
    if( tipo === 'usuarios') {
        
       Usuario.findById( id, (err, usuario) => {

           if (!usuario) {
               return  res.status(400).json({
                   ok: false,
                   mensaje: 'No existe un usuario el ID ' + id,
                   errors: { message: 'El usuario no existe'}
               });
           }

            var pathOriginal = './uploads/usuarios/' + usuario.img;

            //Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathOriginal) ) {
                fs.unlink( pathOriginal );
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                }); 
            });

       });  

    }
    if( tipo === 'medicos') {

        Medico.findById( id, (err, medico) => {

            if (!medico) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un médico el ID ' + id,
                    errors: { message: 'Médico no existe'}
                });
            }

            var pathOriginal = './uploads/medicos/' + medico.img;

            //Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathOriginal) ) {
                fs.unlink( pathOriginal );
            }

            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                }); 
            });

        });  

    }
    if( tipo === 'hospitales') {

        Hospital.findById( id, (err, hospital) => {

            if (!hospital) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un médico el ID ' + id,
                    errors: { message: 'Hospital no existe'}
                });
            }

            var pathOriginal = './uploads/hospitales/' + hospital.img;

            //Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathOriginal) ) {
                fs.unlink( pathOriginal );
            }

            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado) => {
                if (err) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                }); 
            });

       });  
    }

}

module.exports = app;