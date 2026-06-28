import { notFound, redirect } from "next/navigation"
import { getLinksCollection } from "@/lib/mongodb"
import { validateAlias } from "@/lib/links.mjs"

export const runtime = "nodejs"

export default async function Page({ params }) {
  const shorturl = (await params).shorturl
  const validation = validateAlias(shorturl)

  if (validation.error) {
    notFound()
  }

  const collection = await getLinksCollection()
  const doc = await collection.findOne(
    { shorturl: validation.value },
    { projection: { url: 1 } }
  )

  if (!doc) {
    notFound()
  }

  redirect(doc.url)
}
