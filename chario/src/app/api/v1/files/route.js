import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT, // e.g., https://s3.filebase.com
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function POST(request) {

    // const { session, user } = await auth.api.getSession({
    //     headers: await headers()
    // })

    // if (!user) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             error: "Unauthorized",
    //         },
    //         { status: 401 }
    //     );
    // }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        console.log("STARTING UPLOAD")

        //Check if file is too large
        //TODO: Check the actual file size
        if (file.size > 1024 * 1024 * 10) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File is too large",
                },
                { status: 400 }
            );
        }

        const allowedFileTypes = [
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.bmp',
            '.svg',
            '.webp',
        ];

        // Check if the file is of an allowed image type
        if (!allowedFileTypes.includes(`.${file.name.split('.').pop().toLowerCase()}`)) {
            console.log("Invalid file type");
            return NextResponse.json(
                {
                    success: false,
                    error: "File is not an allowed image type",
                },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No file provided",
                },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        // Create a unique filename
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `chario/${fileName}`;

        // Upload file directly
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "docu",
            Key: filePath,
            Body: fileBuffer,
            ContentType: file.type,
        });

        let file_cid = "";
        command.middlewareStack.add(
            (next) => async (args) => {
                const response = await next(args);
                if (!response.response.statusCode) return response;

                file_cid = response.response.headers["x-amz-meta-cid"];
                return response;
            },
            {
                step: "build",
                name: "addCidToOutput",
            }
        );

        await s3Client.send(command);
        // console.log(process.env.IPFS_GATEWAY + cid);

        return NextResponse.json({
            success: true,
            data: {
                file_path: filePath,
                file_cid: file_cid,
                file_name: file.name,
                file_type: file.type,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {

    // const { session, user } = await auth.api.getSession({
    //     headers: await headers()
    // })

    // if (!user) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             error: "Unauthorized",
    //         },
    //         { status: 401 }
    //     );
    // }

    const file_path = request.nextUrl.searchParams.get("file_path");
    const file_id = request.nextUrl.searchParams.get("file_id");

    console.log(file_path)
    console.log(file_id)

    const params = {
        Bucket: process.env.S3_BUCKET_NAME || "docu",
        Key: file_path,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    return NextResponse.json({
        success: true,
        data: {
            file_path,
        },
    });
}