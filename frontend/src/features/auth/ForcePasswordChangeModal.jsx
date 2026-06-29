import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForcePasswordChangeModal() {
  const [submitting, setSubmitting] = useState(false)
  const updateUser = useAuthStore((state) => state.updateUser)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  })

  const newPassword = watch('new_password')

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const { data } = await authApi.changePassword(formData)
      toast.success(data.message)
      // Met à jour le store pour fermer le modal
      updateUser({ must_change_password: false })
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.errors) {
        Object.values(errorData.errors).flat().forEach((msg) => toast.error(msg))
      } else {
        toast.error('Erreur lors du changement de mot de passe')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Indicateur visuel de force du mot de passe
  const passwordStrength = (() => {
    if (!newPassword) return null
    let score = 0
    if (newPassword.length >= 8) score++
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++
    if (/\d/.test(newPassword)) score++
    if (newPassword.length >= 12) score++
    return score
  })()

  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const strengthColors = ['text-danger', 'text-warning', 'text-warning', 'text-success', 'text-success']

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-up">
      <div className="bg-surface border border-border-subtle rounded-2xl p-7 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-warning/15 grid place-items-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-warning">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-1.5">Changement de mot de passe</h2>
          <p className="text-sm text-text-secondary">
            Pour votre sécurité, vous devez changer le mot de passe initial avant d'utiliser l'application.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="password"
            label="Mot de passe actuel"
            placeholder="Mot de passe fourni par votre installateur"
            {...register('current_password', { required: 'Requis' })}
            error={errors.current_password?.message}
          />

          <Input
            type="password"
            label="Nouveau mot de passe"
            placeholder="Au moins 8 caractères"
            {...register('new_password', { required: 'Requis' })}
            error={errors.new_password?.message}
          />

          {/* Indicateur de force */}
          {passwordStrength !== null && (
            <div className="flex items-center gap-2 text-xs -mt-2">
              <div className="flex-1 h-1 bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength >= 3 ? 'bg-success' : 
                    passwordStrength >= 2 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <span className={`font-medium ${strengthColors[passwordStrength]}`}>
                {strengthLabels[passwordStrength]}
              </span>
            </div>
          )}

          <Input
            type="password"
            label="Confirmer le nouveau mot de passe"
            placeholder="Ressaisissez le nouveau mot de passe"
            {...register('new_password_confirmation', { required: 'Requis' })}
            error={errors.new_password_confirmation?.message}
          />

          {/* Critères de sécurité */}
          <div className="bg-elevated rounded-lg p-3 text-[11px] text-text-tertiary space-y-1">
            <div className="font-medium text-text-secondary text-xs mb-1.5">
              Le mot de passe doit contenir :
            </div>
            <div className={newPassword?.length >= 8 ? 'text-success' : ''}>
              • Au moins 8 caractères
            </div>
            <div className={/[a-z]/.test(newPassword || '') && /[A-Z]/.test(newPassword || '') ? 'text-success' : ''}>
              • Des majuscules et minuscules
            </div>
            <div className={/\d/.test(newPassword || '') ? 'text-success' : ''}>
              • Au moins un chiffre
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full mt-2"
          >
            Changer le mot de passe
          </Button>
        </form>
      </div>
    </div>
  )
}