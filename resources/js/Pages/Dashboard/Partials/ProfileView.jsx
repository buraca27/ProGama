import React from "react";
import UpdateProfileInformationForm from "@/Pages/Profile/Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm";
import UpdateThemeForm from "@/Pages/Profile/Partials/UpdateThemeForm";

export default function ProfileView({ mustVerifyEmail, status }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <UpdateThemeForm className="max-w-xl" />
            </div>
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                    className="max-w-xl"
                />
            </div>
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <UpdatePasswordForm className="max-w-xl" />
            </div>
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                <DeleteUserForm className="max-w-xl" />
            </div>
        </div>
    );
}
