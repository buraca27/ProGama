import React from "react";
import UpdateProfileInformationForm from "./UpdateProfileInformationForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteUserForm from "./DeleteUserForm";
import UpdateThemeForm from "./UpdateThemeForm";

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
