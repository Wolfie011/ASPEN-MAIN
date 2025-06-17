"use client";

import { SignInForm } from "@/components/forms/sign-in-form";
import { SignUpForm } from "@/components/forms/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function AuthPage() {
	return (
		<div className="flex min-h-screen bg-gray-700">
			<div className="flex w-full h-1/2 max-w-7xl m-auto rounded-lg shadow-lg overflow-hidden bg-gray-800">
				{/* Left square: Logo and Lorem Ipsum */}
				<div className="w-3/5 p-8 flex flex-col justify-center items-center text-white">
					<Image
						src="/medicaltech.png"
						alt="Logo"
						width={400}
						height={0}
						className="mb-6 p-2 rounded-xl"
					/>
					<p className="text-center">
						&quot;Nowoczesna aplikacja medyczna, która ułatwia zarządzanie
						danymi pacjentów i wspiera specjalistów w codziennej pracy.
						Bezpieczny dostęp do kluczowych informacji w jednym miejscu, zawsze
						pod ręką. Dołącz do cyfrowej rewolucji w medycynie – dołącz już
						teraz!&quot;
					</p>
				</div>

				{/* Right square: Tabs with forms */}
				<div className="w-2/5 p-8 flex items-center justify-center border-l border-gray-700">
					<div className="w-full max-w-sm">
						<Tabs defaultValue="signin" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="signin">Login</TabsTrigger>
								<TabsTrigger value="signup">Rejestracja</TabsTrigger>
							</TabsList>
							<TabsContent value="signin">
								<SignInForm />
							</TabsContent>
							<TabsContent value="signup">
								<SignUpForm />
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	);
}
