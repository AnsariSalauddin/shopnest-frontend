import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { logout } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    }
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.put('/users/profile', data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Avatar card */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold uppercase">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'}`}>
            {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input {...register('firstName', { required: 'Required' })} className="input-field" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input {...register('lastName', { required: 'Required' })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input {...register('phone')} className="input-field" placeholder="+91 9876543210" />
          </div>

          <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-3 pt-2">Default Address</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
            <input {...register('address')} className="input-field" placeholder="House no, Street, Area" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input {...register('city')} className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input {...register('state')} className="input-field" placeholder="Maharashtra" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
            <input {...register('pincode')} className="input-field" placeholder="400001" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => { dispatch(logout()); navigate('/') }}
              className="btn-danger px-6 py-3">
              Sign Out
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
