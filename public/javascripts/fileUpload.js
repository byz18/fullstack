// AWS s3
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion

})

const { coverImageBasePath, coverImageName } = require('./models/vinyl')


app.post(coverImageBasePath, upload.single(coverImageName), async (req, res) => {

    req.file.buffer

    const bucketParams = {
        Bucket: bucketName,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    }

    const command = new PutObjectCommand(bucketParams)

    await s3.send(command)

    res.send({})
})