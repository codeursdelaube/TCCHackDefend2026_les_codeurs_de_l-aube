'use client'

import { useEffect, useState } from 'react'
import { Landmark, Loader2, Pencil, Plus, Trash2, Utensils, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, clearClientCache } from '@/lib/utils/http'
import { DISH_CATEGORIES, PLACE_REGIONS, type CatalogDish, type CatalogPlace } from '@/lib/catalog/types'

type Kind = 'places' | 'dishes'

type PlaceForm = {
  slug: string
  name: string
  description: string
  history: string
  region: string
  locality: string
  latitude: string
  longitude: string
  image_url: string
  is_unesco: boolean
  is_published: boolean
  best_time: string
  duration: string
  outfit: string
  access_info: string
  fee: string
}

type DishForm = {
  slug: string
  name: string
  description: string
  history: string
  accompaniments: string
  category: string
  region: string
  image_url: string
  is_published: boolean
}

const emptyPlace = (): PlaceForm => ({
  slug: '',
  name: '',
  description: '',
  history: '',
  region: 'Maritime',
  locality: '',
  latitude: '',
  longitude: '',
  image_url: '',
  is_unesco: false,
  is_published: true,
  best_time: '',
  duration: '',
  outfit: '',
  access_info: '',
  fee: '',
})

const emptyDish = (): DishForm => ({
  slug: '',
  name: '',
  description: '',
  history: '',
  accompaniments: '',
  category: 'Plat Principal',
  region: '',
  image_url: '',
  is_published: true,
})

function placeToForm(place: CatalogPlace): PlaceForm {
  return {
    slug: place.slug,
    name: place.nom,
    description: place.description,
    history: place.histoire,
    region: String(place.région),
    locality: place.localite,
    latitude: String(place.lat),
    longitude: String(place.lng),
    image_url: place.image,
    is_unesco: place.isUnesco,
    is_published: place.isPublished,
    best_time: place.bestTime || '',
    duration: place.duration || '',
    outfit: place.outfit || '',
    access_info: place.access || '',
    fee: place.fee || '',
  }
}

function dishToForm(dish: CatalogDish): DishForm {
  return {
    slug: dish.slug,
    name: dish.nom,
    description: dish.description,
    history: dish.histoire,
    accompaniments: dish.accompaniments || '',
    category: String(dish.catégorie),
    region: dish.region || '',
    image_url: dish.image,
    is_published: dish.isPublished,
  }
}

export default function CatalogManager({ kind }: { kind: Kind }) {
  const [items, setItems] = useState<(CatalogPlace | CatalogDish)[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [placeForm, setPlaceForm] = useState<PlaceForm>(emptyPlace())
  const [dishForm, setDishForm] = useState<DishForm>(emptyDish())

  const isPlaces = kind === 'places'

  const load = async () => {
    setLoading(true)
    const result = isPlaces
      ? await apiFetch<{ places?: CatalogPlace[] }>('/api/admin/places')
      : await apiFetch<{ dishes?: CatalogDish[] }>('/api/admin/dishes')
    if (result.ok && result.data) {
      if (isPlaces && 'places' in result.data) {
        setItems(result.data.places || [])
      } else if (!isPlaces && 'dishes' in result.data) {
        setItems(result.data.dishes || [])
      }
    } else {
      toast.error(result.error || 'Chargement impossible')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind])

  const openCreate = () => {
    setEditingId(null)
    setPlaceForm(emptyPlace())
    setDishForm(emptyDish())
    setShowForm(true)
  }

  const openEdit = (item: CatalogPlace | CatalogDish) => {
    setEditingId(item.slug)
    if (isPlaces) setPlaceForm(placeToForm(item as CatalogPlace))
    else setDishForm(dishToForm(item as CatalogDish))
    setShowForm(true)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', isPlaces ? 'lieux' : 'plats')
      const result = await apiFetch<{ url?: string }>('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!result.ok || !result.data?.url) {
        toast.error(result.error || "Échec de l'upload")
        return
      }
      if (isPlaces) setPlaceForm((current) => ({ ...current, image_url: result.data!.url! }))
      else setDishForm((current) => ({ ...current, image_url: result.data!.url! }))
      toast.success('Image envoyée dans le bucket places')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = isPlaces
        ? {
            ...placeForm,
            latitude: Number(placeForm.latitude),
            longitude: Number(placeForm.longitude),
          }
        : dishForm

      const url = editingId
        ? `/api/admin/${kind}/${editingId}`
        : `/api/admin/${kind}`
      const result = await apiFetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!result.ok) {
        toast.error(result.error || 'Enregistrement impossible')
        return
      }
      toast.success(editingId ? 'Fiche mise à jour' : 'Fiche créée')
      clearClientCache()
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (slug: string) => {
    if (!confirm('Supprimer définitivement cette fiche ?')) return
    const result = await apiFetch(`/api/admin/${kind}/${slug}`, { method: 'DELETE' })
    if (!result.ok) {
      toast.error(result.error || 'Suppression impossible')
      return
    }
    toast.success('Fiche supprimée')
    clearClientCache()
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">
            {isPlaces ? 'Lieux touristiques' : 'Plats culinaires'}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ces fiches sont celles affichées aux visiteurs. Images dans le bucket Supabase « places ».
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          {isPlaces ? 'Nouveau lieu' : 'Nouveau plat'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucune fiche pour le moment.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.slug} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{item.nom}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {isPlaces ? (item as CatalogPlace).localite : (item as CatalogDish).catégorie}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.isPublished ? 'Publié' : 'Brouillon'}
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => openEdit(item)} className="rounded-full border border-border px-3 py-1 text-[11px] font-bold">
                    <Pencil className="mr-1 inline h-3 w-3" /> Modifier
                  </button>
                  <button type="button" onClick={() => remove(item.slug)} className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-bold text-red-600">
                    <Trash2 className="mr-1 inline h-3 w-3" /> Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10">
          <div className="mb-10 w-full max-w-2xl rounded-3xl bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-serif text-xl font-bold">
                {isPlaces ? <Landmark className="h-5 w-5 text-primary" /> : <Utensils className="h-5 w-5 text-primary" />}
                {editingId ? 'Modifier la fiche' : 'Créer une fiche'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <label className="text-xs font-bold">
                Nom
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={isPlaces ? placeForm.name : dishForm.name}
                  onChange={(e) => isPlaces
                    ? setPlaceForm({ ...placeForm, name: e.target.value })
                    : setDishForm({ ...dishForm, name: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold">
                Identifiant (slug)
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  placeholder="ex: koutamakou"
                  value={isPlaces ? placeForm.slug : dishForm.slug}
                  onChange={(e) => isPlaces
                    ? setPlaceForm({ ...placeForm, slug: e.target.value })
                    : setDishForm({ ...dishForm, slug: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold">
                Description
                <textarea
                  className="mt-1 h-20 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={isPlaces ? placeForm.description : dishForm.description}
                  onChange={(e) => isPlaces
                    ? setPlaceForm({ ...placeForm, description: e.target.value })
                    : setDishForm({ ...dishForm, description: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold">
                Histoire
                <textarea
                  className="mt-1 h-24 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={isPlaces ? placeForm.history : dishForm.history}
                  onChange={(e) => isPlaces
                    ? setPlaceForm({ ...placeForm, history: e.target.value })
                    : setDishForm({ ...dishForm, history: e.target.value })}
                />
              </label>

              {isPlaces ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold">
                      Région
                      <select
                        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                        value={placeForm.region}
                        onChange={(e) => setPlaceForm({ ...placeForm, region: e.target.value })}
                      >
                        {PLACE_REGIONS.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-bold">
                      Localité
                      <input
                        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                        value={placeForm.locality}
                        onChange={(e) => setPlaceForm({ ...placeForm, locality: e.target.value })}
                      />
                    </label>
                    <label className="text-xs font-bold">
                      Latitude
                      <input
                        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                        value={placeForm.latitude}
                        onChange={(e) => setPlaceForm({ ...placeForm, latitude: e.target.value })}
                      />
                    </label>
                    <label className="text-xs font-bold">
                      Longitude
                      <input
                        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                        value={placeForm.longitude}
                        onChange={(e) => setPlaceForm({ ...placeForm, longitude: e.target.value })}
                      />
                    </label>
                    <label className="text-xs font-bold">
                      Meilleure période
                      <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={placeForm.best_time} onChange={(e) => setPlaceForm({ ...placeForm, best_time: e.target.value })} />
                    </label>
                    <label className="text-xs font-bold">
                      Durée de visite
                      <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={placeForm.duration} onChange={(e) => setPlaceForm({ ...placeForm, duration: e.target.value })} />
                    </label>
                    <label className="text-xs font-bold">
                      Tenue
                      <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={placeForm.outfit} onChange={(e) => setPlaceForm({ ...placeForm, outfit: e.target.value })} />
                    </label>
                    <label className="text-xs font-bold">
                      Accès
                      <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={placeForm.access_info} onChange={(e) => setPlaceForm({ ...placeForm, access_info: e.target.value })} />
                    </label>
                    <label className="text-xs font-bold sm:col-span-2">
                      Tarif
                      <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={placeForm.fee} onChange={(e) => setPlaceForm({ ...placeForm, fee: e.target.value })} />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <input type="checkbox" checked={placeForm.is_unesco} onChange={(e) => setPlaceForm({ ...placeForm, is_unesco: e.target.checked })} />
                    Site UNESCO
                  </label>
                </>
              ) : (
                <>
                  <label className="text-xs font-bold">
                    Catégorie
                    <select
                      className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
                      value={dishForm.category}
                      onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    >
                      {DISH_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Région (optionnel)
                    <input className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" value={dishForm.region} onChange={(e) => setDishForm({ ...dishForm, region: e.target.value })} />
                  </label>
                  <label className="text-xs font-bold">
                    Accompagnements
                    <textarea className="mt-1 h-20 w-full rounded-xl border border-border bg-background p-3 text-sm" value={dishForm.accompaniments} onChange={(e) => setDishForm({ ...dishForm, accompaniments: e.target.value })} />
                  </label>
                </>
              )}

              <label className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={isPlaces ? placeForm.is_published : dishForm.is_published}
                  onChange={(e) => isPlaces
                    ? setPlaceForm({ ...placeForm, is_published: e.target.checked })
                    : setDishForm({ ...dishForm, is_published: e.target.checked })}
                />
                Publier (visible aux visiteurs)
              </label>

              <div className="space-y-2">
                <p className="text-xs font-bold">Image (bucket places)</p>
                {(isPlaces ? placeForm.image_url : dishForm.image_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={isPlaces ? placeForm.image_url : dishForm.image_url} alt="" className="h-28 w-full rounded-xl object-cover" />
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Téléverser une image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadImage(file)
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-border py-3 text-xs font-bold">
                Annuler
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 rounded-full bg-primary py-3 text-xs font-bold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
