<<<<<<< HEAD
=======
// resources/js/Pages/Profile/Edit.jsx
>>>>>>> origin/team-b/rafael-oliveira
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
<<<<<<< HEAD
=======
import UpdateThemeForm from './Partials/UpdateThemeForm';
>>>>>>> origin/team-b/rafael-oliveira

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
<<<<<<< HEAD
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
=======
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
>>>>>>> origin/team-b/rafael-oliveira
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
<<<<<<< HEAD
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
=======
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdateThemeForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
>>>>>>> origin/team-b/rafael-oliveira
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

<<<<<<< HEAD
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
=======
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
>>>>>>> origin/team-b/rafael-oliveira
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/team-b/rafael-oliveira
