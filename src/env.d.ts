/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		session: import("./db").Session | null;
	}
}