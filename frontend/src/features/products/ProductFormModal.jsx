import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { productsApi } from '@/api/products'



export function ProductFormModal({ open, onClose, product, onSaved }) {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Pré-remplit le formulaire en mode édition
useEffect(() => {
  if (open) {
    if (isEdit) {
      reset({
        name: product.name,
        brand: product.brand,
        category: product.category,
        storage: product.storage,
        price: product.price,
        stock: product.stock,
        color: product.color, // 🆕 maintenant un texte
        description: product.description || '',
        is_new: product.is_new,
      })
    } else {
      reset({
        name: '',
        brand: 'Apple iPhone', // 🆕 marque par défaut
        category: 'premium',
        storage: '128 Go',
        price: '',
        stock: '',
        color: 'Noir', // 🆕 couleur par défaut
        description: '',
        is_new: false,
      })
    }
  }
}, [open, product, isEdit, reset])

const onSubmit = async (data) => {
  setLoading(true)
  try {
    const payload = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      is_new: !!data.is_new,
      // ⛔ Plus de "color: selectedColor" : data.color contient déjà la valeur
    }

    if (isEdit) {
      await productsApi.update(product.id, payload)
      toast.success('Produit modifié avec succès')
    } else {
      await productsApi.create(payload)
      toast.success('Produit ajouté au catalogue')
    }

    onSaved()
    onClose()
  } catch (err) {
    const errorData = err.response?.data
    if (errorData?.errors) {
      Object.values(errorData.errors).flat().forEach((msg) => toast.error(msg))
    } else {
      toast.error(errorData?.message || 'Une erreur est survenue')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le produit' : 'Nouveau produit'}
      subtitle={isEdit ? `Édition de ${product.name}` : 'Ajoutez un téléphone à votre catalogue'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isEdit ? 'Enregistrer' : 'Créer le produit'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nom du modèle"
            placeholder="ex. Aurora X2"
            error={errors.name?.message}
            {...register('name', { required: 'Nom requis' })}
          />
          <Select label="Marque" {...register('brand')}>
  <option value="Apple iPhone">Apple iPhone</option>
  <option value="Samsung">Samsung</option>
  <option value="Oppo">Oppo</option>
  <option value="Xiaomi">Xiaomi</option>
</Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Catégorie" {...register('category')}>
            <option value="premium">Premium</option>
            <option value="midrange">Milieu de gamme</option>
            <option value="entry">Entrée de gamme</option>
          </Select>
          <Select label="Stockage" {...register('storage')}>
            {['64 Go', '128 Go', '256 Go', '512 Go', '1 To'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix de vente"
            type="number"
            step="0.01"
            min="0"
            prefix="DH"
            placeholder="0,00"
            error={errors.price?.message}
            {...register('price', { required: 'Prix requis' })}
          />
          <Input
            label="Stock"
            hint="unités"
            type="number"
            min="0"
            placeholder="0"
            className="font-mono"
            error={errors.stock?.message}
            {...register('stock', { required: 'Stock requis' })}
          />
        </div>

       <Input
  label="Couleur"
  hint="ex: Noir, Bleu nuit, Vert menthe"
  placeholder="Saisissez la couleur du téléphone"
  error={errors.color?.message}
  {...register('color', { required: 'Couleur requise' })}
/>

        <Textarea
          label="Description"
          placeholder="Caractéristiques principales…"
          {...register('description')}
        />

        <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors">
          <input
            type="checkbox"
            {...register('is_new')}
            className="w-4 h-4 accent-accent"
          />
          Marquer comme nouveauté
        </label>
      </form>
    </Modal>
  )
}