import React from 'react'
import { AiFillExclamationCircle, AiFillCheckCircle } from "react-icons/ai";


const FormError = ({ message }) => {
    if (!message) return null
    return (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
            <AiFillExclamationCircle className='w-4 h-4' />
            {message}
        </div>
    )
}

const FormSuccess = ({ message }) => {
    if (!message) return null
    return (
        <div className="bg-green-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-600">
            <AiFillCheckCircle className='w-4 h-4' />
            {message}
        </div>
    )
}

export { FormError, FormSuccess }