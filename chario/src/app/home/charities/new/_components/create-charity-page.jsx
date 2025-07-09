'use client'

import CreateCharityForm from "@/components/md/forms/create-charity-form"
import { createCharitySchema } from "@/helpers/zod/charity-schema";
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateCharityFormComponent from "@/components/md/forms/create-charity-form";
import CharityCardMd from "@/components/md/charity-card-md";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useChario } from "@/hooks/use-chario";



function CreateCharityPage() {

    const params = useParams();
    const router = useRouter();
    const { address } = useAccount();
    const { createCharity, loading } = useChario();

    const CreateCharityForm = useForm({
        resolver: zodResolver(createCharitySchema),
        defaultValues: {
            title: "",
            description: "",
            target: "",
            deadline: "",
            image: null,
        },
    })

    const watchForm = CreateCharityForm.watch();

    // useEffect(() => {
    //     console.log("Current form values:", watchForm);

    //     const result = createCharitySchema.safeParse(watchForm);

    //     if (!result.success) {
    //         // result.error is a ZodError object containing detailed errors
    //         console.log("Validation errors:", result.error.format());
    //     } else {
    //         console.log("No validation errors");
    //     }
    // }, [watchForm]);


    async function onSubmit(data) {
        console.log(data);
        console.log("____________making");
        await createCharity({
            owner: address,
            title: data.title,
            description: data.description,
            target: data.target, // 2.5 ETH
            deadline: Math.floor(new Date(watchForm.deadline).getTime() / 1000),
            image: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${watchForm.image.file_cid}`
        });
        toast.success("Charity created successfully");
    }

    return (
        <div className="p-8 pt-10">
            <p className='text-2xl font-semibold mb-1 '>
                Specify the file you want to analyze
            </p>
            <p className='text-muted-foreground  text-xs mb-8'>
                By uploading files, you confirm that you have the necessary rights to any content that you upload. Do not use content that infringes on others intellectual property or privacy rights.
            </p>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <CreateCharityFormComponent
                    form={CreateCharityForm}
                    onSubmit={onSubmit}
                />
                <div className="p-4 bg-border rounded-lg ring-1 ring-input">
                    <h2 className='text-2xl font-semibold mb-4 text-center'>
                        Preview
                    </h2>
                    <div className="flex justify-center">
                        <CharityCardMd
                            charity={{
                                title: watchForm.title,
                                description: watchForm.description,
                                amountCollected: 0,
                                target: watchForm.target,
                                deadline: Math.floor(new Date(watchForm.deadline).getTime() / 1000),
                                image: watchForm.image?.file_path ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${watchForm.image.file_cid}` : watchForm.image?.local_preview_url,
                            }}
                        />
                    </div>
                    <div className='mt-6 text-muted-foreground text-sm'>
                        <h3 className='font-medium text-white mb-2 font-semibold'>Preview Notes:</h3>
                        <ul className='list-disc pl-5 space-y-1'>
                            <li>This is how your charity will appear to donors</li>
                            <li>Image will be cropped to square aspect ratio</li>
                            <li>Target amount is in ETH (1 ETH = 1.000000000000000000 ETH)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateCharityPage