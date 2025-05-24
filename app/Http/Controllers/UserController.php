<?php


namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $users = User::with(['roles'])->get();
        
        $roles = Role::all();
        
        return Inertia::render('Users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);
        
        $user->assignRole($request->role);
        
        return redirect()->route('users.index')
                        ->with('message', 'User berhasil ditambahkan.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $roles = Role::all();
        
        return Inertia::render('Users/Edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);
        
        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }
        
        // Sync roles
        $user->syncRoles([$request->role]);
        
        return redirect()->route('users.index')
                        ->with('message', 'User berhasil diperbarui.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        // Prevent self-deactivation
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun anda sendiri.');
        }
        
        $user->update([
            'is_active' => !$user->is_active,
        ]);
        
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return back()->with('message', "User {$user->name} berhasil {$status}.");
    }

    /**
     * Reset user password to default value.
     */
    public function resetPassword(User $user)
    {
        // Generate default password based on role or use 'password123'
        $defaultPassword = 'password123';
        
        if ($user->hasRole('admin')) {
            $defaultPassword = 'admin123';
        } elseif ($user->hasRole('kepala_sekolah')) {
            $defaultPassword = 'kepsek123';
        } elseif ($user->hasRole('guru')) {
            $defaultPassword = 'guru123';
        } elseif ($user->hasRole('siswa')) {
            $defaultPassword = 'siswa123';
        }
        
        $user->update([
            'password' => Hash::make($defaultPassword),
        ]);
        
        return back()->with('message', "Password user {$user->name} berhasil direset.");
    }
}