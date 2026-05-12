<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'ProGama') }}</title>

    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            // Força o fundo escuro (gray-900 do Tailwind) antes do CSS carregar
            document.documentElement.style.backgroundColor = '#111827'; 
        } else {
            document.documentElement.classList.remove('dark');
            // Força o fundo claro (gray-100 do Tailwind) antes do CSS carregar
            document.documentElement.style.backgroundColor = '#f3f4f6';
        }
    </script>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-gray-100 dark:bg-gray-900">
    @inertia
</body>

</html>