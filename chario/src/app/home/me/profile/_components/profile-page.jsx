'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { CheckIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function ProfilePage({ user: rawUser }) {
    const [user, setUser] = useState();
    const [extraData, setExtraData] = useState({
        phoneNumber: '',
        phoneVerified: false,
        passportNumber: '',
        passportCountry: '',
        passportExpiry: '',
        passportVerified: false,
        verificationServiceStatus: 'none', // 'none', 'pending', 'accepted', 'rejected'
    });

    // Separate state for form inputs
    const [phoneForm, setPhoneForm] = useState({ phoneNumber: '' });
    const [passportForm, setPassportForm] = useState({
        passportNumber: '',
        passportCountry: '',
        passportExpiry: '',
    });

    // New state for consent checkboxes
    const [agreePhoneSend, setAgreePhoneSend] = useState(false);
    const [agreePassportSend, setAgreePassportSend] = useState(false);
    const [agreeVerificationServiceSend, setAgreeVerificationServiceSend] = useState(false);

    useEffect(() => {
        if (rawUser) {
            const newUser = JSON.parse(rawUser);
            setUser(newUser);
            const userExtraData = newUser?.extraData || {};

            setExtraData(prev => ({
                ...prev,
                verificationServiceStatus: 'none', // Ensure default status is set
                ...userExtraData,
            }));

            // Initialize form states with current extraData values for editing
            setPhoneForm({ phoneNumber: userExtraData.phoneNumber || '' });
            setPassportForm({
                passportNumber: userExtraData.passportNumber || '',
                passportCountry: userExtraData.passportCountry || '',
                passportExpiry: userExtraData.passportExpiry || '',
            });

            // Reset consent checkboxes on load (user must re-agree for new submissions)
            setAgreePhoneSend(false);
            setAgreePassportSend(false);
            setAgreeVerificationServiceSend(false);
        }
    }, [rawUser]);

    // Handle input changes for phone form
    function handlePhoneInputChange(phoneNumber) {
        if (!extraData.phoneVerified) {
            setPhoneForm(prev => ({ ...prev, phoneNumber: phoneNumber }));
        }
    }

    // Handle input changes for passport form
    function handlePassportInputChange(e) {
        if (!extraData.passportVerified) {
            const { id, value } = e.target;
            setPassportForm(prev => ({ ...prev, [id]: value }));
        }
    }

    // Generic function to send data to the server
    const sendExtraDataToServer = async (dataToSend) => {
        console.log("Sending full extraData to server:", dataToSend);
        try {
            const response = await fetch('/api/v1/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile data on server.');
            }

            const result = await response.json();
            console.log("Server response:", result);
            return result;
        } catch (error) {
            console.error('Error sending data to server:', error);
            throw error;
        }
    };

    async function handlePhoneSubmit(e) {
        e.preventDefault();

        if (extraData.phoneVerified) {
            toast.warn('Phone number is already verified and cannot be changed.');
            return;
        }

        // Check if consent checkbox is checked
        if (!agreePhoneSend) {
            toast.error('Please agree to send your phone data.');
            return;
        }

        const dataToSend = {
            ...extraData,
            phoneNumber: phoneForm.phoneNumber,
        };

        try {
            const serverResponse = await sendExtraDataToServer(dataToSend);
            setExtraData(serverResponse);
            toast.success('Phone number saved successfully!');
            setAgreePhoneSend(false); // Reset checkbox after successful submission
        } catch (error) {
            toast.error(`Error saving phone number: ${error.message}`);
        }
    }

    async function handlePassportSubmit(e) {
        e.preventDefault();

        if (extraData.passportVerified) {
            toast.warn('Passport data is already verified and cannot be changed.');
            return;
        }

        // Check if consent checkbox is checked
        if (!agreePassportSend) {
            toast.error('Please agree to send your passport data.');
            return;
        }

        const dataToSend = {
            ...extraData,
            ...passportForm,
        };

        try {
            const serverResponse = await sendExtraDataToServer(dataToSend);
            setExtraData(serverResponse);
            toast.success('Passport data saved successfully!');
            setAgreePassportSend(false); // Reset checkbox after successful submission
        } catch (error) {
            toast.error(`Error saving passport data: ${error.message}`);
        }
    }

    async function handleVerificationServiceSubmit(e) {
        e.preventDefault();

        if (extraData.verificationServiceStatus !== 'none' && extraData.verificationServiceStatus !== 'rejected') {
            toast.warn(`Verification is already ${extraData.verificationServiceStatus}. Please wait for a status update.`);
            return;
        }

        // Check if consent checkbox is checked
        if (!agreeVerificationServiceSend) {
            toast.error('Please agree to initiate the full verification service.');
            return;
        }

        const dataToSend = {
            ...extraData,
            verificationServiceStatus: 'pending',
        };

        try {
            const serverResponse = await sendExtraDataToServer(dataToSend);
            setExtraData(serverResponse);
            toast.success('Verification request submitted! Status is now pending.');
            setAgreeVerificationServiceSend(false); // Reset checkbox after successful submission
        } catch (error) {
            toast.error(`Error submitting verification request: ${error.message}`);
        }
    }

    // Helper to render status icon and text
    const renderVerificationStatus = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <div className='flex items-center gap-2 text-yellow-600'>
                        <ClockIcon size={18} />
                        <span>Verification Pending</span>
                    </div>
                );
            case 'accepted':
                return (
                    <div className='flex items-center gap-2 text-green-500'>
                        <CheckIcon size={18} />
                        <span>Verified</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className='flex items-center gap-2 text-red-500'>
                        <XCircleIcon size={18} />
                        <span>Verification Rejected</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='p-2 md:p-6 lg:p-8 pt-10'>
            <p className='text-2xl font-semibold mb-1 '>
                Your profile
            </p>
            <p className='text-muted-foreground text-sm mb-16'>
                Your verification level: {user?.verifiedLevel}
            </p>

            <p className='text-xl font-semibold mb-6'>
                You can upgrade your verification level by completing the KYC process.
            </p>

            {/* Phone Number Section */}
            <form onSubmit={handlePhoneSubmit} className='relative border-y border-input py-4 '>
                <p className='text-accent-foreground text-lg mb-4'>
                    Phone number <span className='text-muted-foreground text-sm'>(we will call you to verify your phone number)</span>
                </p>
                <div className='flex flex-col gap-2 max-w-lg'>
                    <PhoneInput
                        className='w-60 mb-4'
                        placeholder='Enter your phone number'
                        value={phoneForm.phoneNumber}
                        onChange={handlePhoneInputChange}
                        disabled={extraData.phoneVerified}
                        required={!extraData.phoneVerified}
                    />
                    {extraData.phoneVerified ? (
                        <div className='flex items-center gap-2 text-green-500'>
                            <CheckIcon size={18} />
                            <span>Verified</span>
                        </div>
                    ) : (
                        <>
                            {/* Consent Checkbox for Phone */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="agreePhoneSend"
                                    checked={agreePhoneSend}
                                    onChange={(e) => setAgreePhoneSend(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="agreePhoneSend" className="text-sm font-medium text-muted-foreground cursor-pointer">
                                    I agree to save this phone number.
                                </label>
                            </div>
                            <Button
                                type="submit w-max"
                                disabled={!phoneForm.phoneNumber || !agreePhoneSend} // Disabled if consent not given
                            >
                                Save Phone Number
                            </Button>
                        </>
                    )}
                </div>
            </form>

            {/* Passport Data Section */}
            <form onSubmit={handlePassportSubmit} className='relative border-b border-input py-4 '>
                <p className='text-accent-foreground text-lg mb-4'>
                    Passport Information <span className='text-muted-foreground text-sm'>(for higher verification levels)</span>
                </p>
                <div className='grid gap-4 max-w-lg'>
                    <div>
                        <label htmlFor="passportNumber" className="block text-sm font-medium text-muted-foreground mb-1">
                            Passport Number
                        </label>
                        <Input
                            id="passportNumber"
                            className='w-full'
                            placeholder='Enter passport number'
                            value={passportForm.passportNumber}
                            onChange={handlePassportInputChange}
                            disabled={extraData.passportVerified}
                            required={!extraData.passportVerified}
                        />
                    </div>
                    <div>
                        <label htmlFor="passportCountry" className="block text-sm font-medium text-muted-foreground mb-1">
                            Issuing Country
                        </label>
                        <Input
                            id="passportCountry"
                            className='w-full'
                            placeholder='e.g., United States'
                            value={passportForm.passportCountry}
                            onChange={handlePassportInputChange}
                            disabled={extraData.passportVerified}
                            required={!extraData.passportVerified}
                        />
                    </div>
                    <div>
                        <label htmlFor="passportExpiry" className="block text-sm font-medium text-muted-foreground mb-1">
                            Expiration Date
                        </label>
                        <Input
                            id="passportExpiry"
                            type="date"
                            className='w-full'
                            value={passportForm.passportExpiry}
                            onChange={handlePassportInputChange}
                            disabled={extraData.passportVerified}
                            required={!extraData.passportVerified}
                        />
                    </div>

                    <div className='flex flex-col gap-2 mt-2'>
                        {extraData.passportVerified ? (
                            <div className='flex items-center gap-2 text-green-500'>
                                <CheckIcon size={18} />
                                <span>Verified</span>
                            </div>
                        ) : (
                            <>
                                {/* Consent Checkbox for Passport */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="agreePassportSend"
                                        checked={agreePassportSend}
                                        onChange={(e) => setAgreePassportSend(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="agreePassportSend" className="text-sm font-medium text-muted-foreground cursor-pointer">
                                        I agree to save this passport data.
                                    </label>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!passportForm.passportNumber || !passportForm.passportCountry || !passportForm.passportExpiry || !agreePassportSend} // Disabled if consent not given
                                >
                                    Save Passport Data
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </form>

            {/* Verification Service Section */}
            <form onSubmit={handleVerificationServiceSubmit} className='relative border-b border-input py-4 '>
                <p className='text-accent-foreground text-lg mb-4'>
                    Full Verification Service <span className='text-muted-foreground text-sm'>(we will perform advanced checks)</span>
                </p>
                <div className='flex gap-2 items-center'>
                    {renderVerificationStatus(extraData.verificationServiceStatus)}

                    {(extraData.verificationServiceStatus === 'none' || extraData.verificationServiceStatus === 'rejected') && (
                        <>
                            {/* Consent Checkbox for Verification Service */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="agreeVerificationServiceSend"
                                    checked={agreeVerificationServiceSend}
                                    onChange={(e) => setAgreeVerificationServiceSend(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="agreeVerificationServiceSend" className="text-sm font-medium text-muted-foreground cursor-pointer">
                                    I understand and agree to initiate full verification.
                                </label>
                            </div>
                            <Button
                                type="submit"
                                disabled={!extraData.passportNumber || !extraData.passportCountry || !extraData.passportExpiry || !agreeVerificationServiceSend} // Disabled if consent not given
                            >
                                Request Full Verification
                            </Button>
                        </>
                    )}
                    {extraData.verificationServiceStatus === 'rejected' && (
                        <span className="text-muted-foreground text-sm ml-2">You can resubmit.</span>
                    )}
                    {extraData.verificationServiceStatus === 'accepted' && (
                        <span className="text-muted-foreground text-sm ml-2">Your profile is fully verified!</span>
                    )}
                </div>
                {extraData.verificationServiceStatus === 'none' && (
                    <p className='text-muted-foreground text-sm mt-2'>
                        Submitting this will initiate an advanced verification process. This cannot be undone until a status is provided.
                    </p>
                )}
            </form>
        </div >
    );
}

export default ProfilePage;