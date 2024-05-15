import multer from 'multer'
import fs from 'fs'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = "./public/temp";
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

export const upload = multer({
    storage,
})