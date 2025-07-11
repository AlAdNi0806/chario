'use client'

import CharityCardMd from '@/components/md/charity-card-md'
import EditCharityFormComponent from '@/components/md/forms/edit-charity-form'
import { editCharitySchema } from '@/helpers/zod/charity-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

function MyCharityPage({ charity: rawCharity }) {

  const [charity, setCharity] = useState();


  const EditCharityForm = useForm({
    resolver: zodResolver(editCharitySchema),
    defaultValues: {
      title: charity?.title || "",
      description: charity?.description || "",
      target: charity?.target || "",
      deadline: charity?.deadline || "",
      image: {
        file_name: `charity-${charity?.title.substring(0, 5)}.jpg`,
        file_cid: charity?.image?.split("/").pop() || "",
        file_path: charity?.image || "",
      },
    },
  })

  const watchForm = EditCharityForm.watch();

  useEffect(() => {
    // Parse charities once and set the state
    console.log("Raw charity:", rawCharity);
    if (rawCharity) {
      const newCharity = JSON.parse(rawCharity);
      setCharity(newCharity);
      EditCharityForm.setValue("title", newCharity?.title || "");
      EditCharityForm.setValue("description", newCharity?.description || "");
      EditCharityForm.setValue("target", newCharity?.target || "");
      if (newCharity?.deadline) {
        format(newCharity?.deadline, "yyyy-MM-dd");
        EditCharityForm.setValue("deadline", newCharity?.deadline || "");
      } else {
        EditCharityForm.setValue("deadline", "");
      }
      EditCharityForm.setValue("image", {
        file_name: `charity-${newCharity?.title.substring(0, 5)}.jpg`,
        file_cid: newCharity?.image?.split("/").pop() || "",
        file_path: newCharity?.image || "",
      });
    }
  }, [rawCharity]);

  async function onSubmit(data) {
    console.log("Data:", data);

    try {
      const result = await fetch(`/api/v1/charity/${charity?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          target: data.target,
          deadline: data.deadline,
          image: data.image,
        }),
      });
      if (result.ok) {
        toast.success("Charity updated successfully");
        router.push(`/home/charities/${charity?.id}`);
      } else {
        const errorData = await result.json();
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error("Error updating charity:", error);
      toast.error("Something went wrong");
    }
  }


  return (
    <div className="p-2 md:p-6 lg:p-8 pt-10">
      <p className='text-2xl font-semibold mb-1 '>
        Edit your charity
      </p>
      <p className='text-muted-foreground  text-xs mb-8'>
        By uploading files, you confirm that you have the necessary rights to any content that you upload. Do not use content that infringes on others intellectual property or privacy rights.
      </p>
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        <EditCharityFormComponent
          form={EditCharityForm}
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
            <h3 className=' text-white mb-2 font-semibold'>Preview Notes:</h3>
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

export default MyCharityPage