import React, { useState } from 'react';
import { base44 } from '../api/apiClient';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function EditProfilePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(user?.avatar_url || null);

    const updateProfileMutation = useMutation({
        mutationFn: (data) => base44.auth.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate(-1);
        },
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        let avatar_url = user?.avatar_url;
        if (avatarFile) {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: avatarFile });
            avatar_url = file_url;
        }
        updateProfileMutation.mutate({ full_name: fullName, avatar_url });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white px-4 py-3 border-b flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">Редактировать профиль</h1>
            </div>
            <div className="p-6 space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-500 text-5xl font-bold">
                                    {fullName?.substring(0, 2).toUpperCase() || "ИИ"}
                                </span>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800">
                            <Upload className="w-4 h-4" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="fullName" className="text-gray-600">Полное имя</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 text-base mt-2"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="text-gray-600">Email</Label>
                        <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="h-12 text-base mt-2 bg-gray-100"
                        />
                    </div>
                </div>
                
                <Button 
                    onClick={handleSave} 
                    disabled={updateProfileMutation.isPending}
                    className="w-full h-14 bg-black text-white text-lg rounded-xl"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </div>
    );
}
