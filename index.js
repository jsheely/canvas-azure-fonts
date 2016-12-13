const app = require('express')();
const Canvas = require('canvas');
const PORT = 8086;

app.get('/:text', (req, res) => {
    let text = req.params.text;

    return new Promise((resolve, reject) => {
        let width = 400;
        let height = 200;
        let canvas = new Canvas(width, height);
        let ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#E2E4E6';
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = '#C4C9CC';
        ctx.strokeRect(0, 0, width, height);

        // Circle
        ctx.fillStyle = '#6f6faf';
        ctx.arc(width/2, height/2, Math.min(width/2, height/2), 0, Math.PI * 2);
        ctx.fill();

        // Text;
        ctx.fillStyle = 'black';
        ctx.font = '12px Calibri';
        wrapText(ctx, text, 105, 30, 295, 22, 2);

        return canvas.toBuffer((err, buff) => {
            return resolve(buff);
        });

    }).then(image => {
        res.setHeader('Content-Type', 'image/png');
        res.write(image);
        res.end();
    });

});

if (require.main === module || (
    require.main.filename.indexOf('interceptor.js') !== -1 &&
    (require.main.children || []).indexOf(module) !== -1)
) {
    app.listen(process.env.PORT || PORT, () => {
        console.log('Image generator online on port: ' + process.env.PORT || PORT);
    });
}



function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    let words = text.split(' ');
    let line = '';
    let lines = 0;
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines++;

            if (maxLines && lines > maxLines) {
                context.fillText(line + '...', x, y);
                return;
            } else {
                context.fillText(line, x, y);
            }

            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);

    // draw the baseline
    context.save();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(maxWidth, y);
    context.strokeStyle = 'red';
    context.stroke();
    context.restore();
}
