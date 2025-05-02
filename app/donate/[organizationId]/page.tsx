'use client';

import { useParams } from 'next/navigation';
import { DonationForm } from '../../components/DonationForm';
import { OrganizationInfoCard } from '../../components/OrganizationInfo';

export default function DonatePage() {
    const params = useParams();
    const organizationId = params.organizationId as string;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <OrganizationInfoCard organizationAddress={organizationId} />
                <DonationForm 
                    organizationAddress={organizationId}
                    onSuccess={() => {
                        // Optionally refresh the organization info or show a success message
                        window.location.reload();
                    }}
                />
            </div>
        </div>
    );
} 