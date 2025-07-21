export default function AppLogo() {
    return (
        <>
            <div className="bg-white border border-gray-200 flex aspect-square size-10 items-center justify-center rounded-lg shadow-sm">
                <img 
                    src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-smp-penida.png" 
                    alt="Destra Logo" 
                    className="size-8 object-contain"
                />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold text-gray-900">SMK PENIDA</span>
                <span className="truncate text-xs text-gray-500">Sistem Evaluasi Guru</span>
            </div>
        </>
    );
}
