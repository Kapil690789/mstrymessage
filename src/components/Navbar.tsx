'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth'; 

function Navbar() {
    const { data: session } = useSession();

    const user: User = session?.user as User;

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' }); // Redirect to home after logout
    };

    return (
        <nav className='p-4 md:p-6 shadow-md'>
            <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
                <a className='text-xl font-bold mb-4 md:mb-0' href="#">Mystry Message</a>
                {
                    session ? (
                        <>
                            <span className='mr-4'>
                                Welcome, {user.username || user.email}
                            </span>
                            <Button className="w-full md:w-auto bg-slate-100 text-black" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link href='/sign-in'>
                            <Button className="w-full md:w-auto bg-slate-100 text-black">Login</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    );
}

export default Navbar;
