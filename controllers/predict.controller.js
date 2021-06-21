const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
var fs = require('fs');

exports.makePredictions = async (req, res, next) => {
    try {
        var params = req.body;
        const inputData = tf.tensor2d([params.pb, params.pap, params.dap, params.papdel, params.papgrueso,
        params.altura_fuste, params.altura_arbol, params.diferencia, params.diametro_copa, params.tallos], [1, 10]);
        var model = await tf.loadLayersModel('file://resources/model.json');
        var x = new Float32Array(10);
        predict = model.predict(inputData);
        predict2 = await tf.argMax(predict, axis = 1).data();

        get_line('./resources/labels.txt', predict2["0"], function (err, line) {
            res.json({
                "prediction": line.replace(/(\r\n|\n|\r)/gm, ""),
                "percentage": parseFloat(predict.dataSync()[predict2["0"]].toFixed(2))
            });
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n");

    if (+line_no > lines.length) {
        throw new Error('File end reached without finding line');
    }
    callback(null, lines[+line_no]);
}