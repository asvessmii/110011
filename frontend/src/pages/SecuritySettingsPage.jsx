import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function SecuritySettingsPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white px-4 py-3 border-b flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">Безопасность</h1>
            </div>
            <div className="p-6 text-center">
                <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold">Раздел в разработке</h2>
                <p className="text-gray-500 mt-2">Здесь будут настройки безопасности вашего аккаунта.</p>
            </div>
        </div>
    );
}
