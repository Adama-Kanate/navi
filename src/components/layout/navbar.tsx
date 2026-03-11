import Link from "next/link"

export function Navbar() {
	return (
		<nav className="w-full border-b bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">

				{/* Logo */}
				<Link href="/" className="text-xl font-semibold">
					navi
				</Link>

				{/* Links */}
				<div className="flex items-center gap-4 sm:gap-6">
					<Link href="/how-it-works" className="text-sm text-gray-600 hover:text-black">
						How it works
					</Link>

					<Link
						href="/signup"
						className="rounded-xl bg-[#1F2A44] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
					>
						Build My Plan →
					</Link>
				</div>

			</div>
		</nav>
	)
}
