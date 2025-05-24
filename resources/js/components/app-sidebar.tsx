import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PageProps, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookmarkIcon,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutGrid,
    LineChart,
    Settings,
    User,
    Users
} from 'lucide-react';
import AppLogo from './app-logo';

interface CustomProps extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string | null;
            created_at: string;
            updated_at: string;
            roles: { name: string }[]; // Array of roles with name property
        };
    };
}

export function AppSidebar() {
    const { auth } = usePage<CustomProps>().props;
    const roles = auth.user?.roles?.map(role => role.name) || [];

    // console.log('User Roles:', roles);
    
    // Menu dasar untuk semua pengguna
    const dashboardMenu: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];
    
    // Menu untuk Admin
    const adminMenu: NavItem[] = [
        {
            title: 'Pengguna',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Kelas',
            href: '/admin/kelas',
            icon: BookmarkIcon,
        },
        {
            title: 'Mata Pelajaran',
            href: '/admin/mata-pelajaran',
            icon: BookOpen,
        },
        {
            title: 'Guru',
            href: '/admin/guru',
            icon: GraduationCap,
        },
        {
            title: 'Periode Evaluasi',
            href: '/admin/periode-evaluasi',
            icon: Calendar,
        },
        {
            title: 'Kriteria Evaluasi',
            href: '/admin/kriteria',
            icon: ClipboardList,
        },
        {
            title: 'Hasil Evaluasi',
            href: '/admin/hasil-evaluasi',
            icon: LineChart,
        },
        {
            title: 'Pengaturan',
            href: '/admin/settings',
            icon: Settings,
        },
    ];
    
    // Menu untuk Kepala Sekolah
    const kepalaSekolahMenu: NavItem[] = [
        {
            title: 'Data Guru',
            href: '/guru',
            icon: GraduationCap,
        },
        {
            title: 'Form Evaluasi',
            href: '/evaluasi-form',
            icon: FileText,
        },
        {
            title: 'Hasil Evaluasi',
            href: '/hasil-evaluasi',
            icon: LineChart,
        },
        {
            title: 'Rekomendasi',
            href: '/rekomendasi',
            icon: Award,
        },
    ];
    
    // Menu untuk Guru
    const guruMenu: NavItem[] = [
        {
            title: 'Profil',
            href: '/profile',
            icon: User,
        },
        {
            title: 'Form Evaluasi Rekan',
            href: '/evaluasi-rekan',
            icon: FileText,
        },
        {
            title: 'Hasil Evaluasi Saya',
            href: '/hasil-evaluasi-saya',
            icon: LineChart,
        },
    ];
    
    // Menu untuk Siswa
    const siswaMenu: NavItem[] = [
        {
            title: 'Form Evaluasi Guru',
            href: '/evaluasi-guru',
            icon: FileText,
        },
        {
            title: 'Kelas Saya',
            href: '/kelas-saya',
            icon: BookmarkIcon,
        },
    ];
    
    // Menentukan menu yang akan ditampilkan berdasarkan role
    let mainNavItems = [...dashboardMenu];
    
    if (roles.includes('admin')) {
        mainNavItems = [...mainNavItems, ...adminMenu];
    } else if (roles.includes('kepala_sekolah')) {
        mainNavItems = [...mainNavItems, ...kepalaSekolahMenu];
    } else if (roles.includes('guru')) {
        mainNavItems = [...mainNavItems, ...guruMenu];
    } else if (roles.includes('siswa')) {
        mainNavItems = [...mainNavItems, ...siswaMenu];
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Bantuan',
            href: '/help',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
