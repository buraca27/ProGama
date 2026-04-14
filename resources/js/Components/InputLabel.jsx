export default function InputLabel({
    value,
<<<<<<< HEAD
    className = '',
=======
    className = "",
>>>>>>> origin/team-b/rafael-oliveira
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
<<<<<<< HEAD
                `block text-sm font-medium text-gray-700 ` +
=======
                `block font-medium text-sm text-gray-700 dark:text-gray-300 ` +
>>>>>>> origin/team-b/rafael-oliveira
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
