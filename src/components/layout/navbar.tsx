"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
	const router = useRouter()
	const supabase = useMemo(() => createClient(), [])
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	useEffect(() => {
		let mounted = true

		supabase.auth.getUser().then(({ data: { user } }) => {
			if (mounted) {
				setIsLoggedIn(!!user)
			}
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setIsLoggedIn(!!session?.user)
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [supabase])

	async function handleLogout() {
		await supabase.auth.signOut()
		setIsLoggedIn(false)
		router.push("/")
		router.refresh()
	}

	return (
		<nav className="w-full border-b bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
				<Link href="/" className="text-xl font-semibold">
					navi
				</Link>

				<div className="flex items-center gap-4 sm:gap-6">
					{isLoggedIn ? (
						<>
							<Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">
								Dashboard
							</Link>
							<Link href="/results" className="text-sm text-gray-600 hover:text-black">
								My results
							</Link>
							<Link href="/paths" className="text-sm text-gray-600 hover:text-black">
								Paths
							</Link>
							<Link href="/mentors" className="text-sm text-gray-600 hover:text-black">
								Mentors
							</Link>
							<Link href="/plan" className="text-sm text-gray-600 hover:text-black">
								My action plan
							</Link>
							<button onClick={handleLogout} className="text-sm text-gray-600 hover:text-black">
								Log out
							</button>
						</>
					) : (
						<>
							<Link href="/how-it-works" className="text-sm text-gray-600 hover:text-black">
								How it works
							</Link>
							<Link href="/login" className="text-sm text-gray-600 hover:text-black">
								Log in
							</Link>
							<Link
								href="/signup"
								className="rounded-xl bg-[#1F2A44] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
							>
								Build my plan →
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}
