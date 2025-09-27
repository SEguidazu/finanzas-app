'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { signOut } from '@/lib/auth'
import { getCategoryTemplates, getOrCreateCategory, getUserCategories } from '@/lib/categories'
import { getBanksForUser } from '@/lib/banks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from "sonner"

type CategoryTemplate = {
  template_id: string
  name: string
  color: string
  icon: string | null
  type: string
  sort_order: number
  is_created: boolean
}

type Bank = {
  id: string
  name: string
  type: string
  is_system_bank: boolean
}

type UserCategory = {
  id: string
  name: string
  color: string
  icon: string | null
  type: string
  subcategories: Array<{ id: string; name: string }>
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [categoryTemplates, setCategoryTemplates] = useState<CategoryTemplate[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load category templates
      const { data: templates } = await getCategoryTemplates('expense')
      if (templates) {
        setCategoryTemplates(templates)
      }

      // Load user's created categories
      const { data: categories } = await getUserCategories()
      if (categories) {
        setUserCategories(categories)
      }

      // Load banks
      const { data: banksData } = await getBanksForUser()
      if (banksData) {
        setBanks(banksData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error("Error", {
        description: error.message,
      })
    } else {
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      })
      router.push('/login')
    }
  }

  const testLazyLoading = async (templateName: string) => {
    try {
      const categoryId = await getOrCreateCategory(templateName)

      if (categoryId.data) {
        toast.success("¡Categoría creada!", {
          description: `La categoría "${templateName}" se creó exitosamente con ID: ${categoryId.data}`,
        })

        const { data: categories } = await getUserCategories()
        if (categories) {
          setUserCategories(categories)
        }
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error("Error", {
        description: "No se pudo crear la categoría",
      })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard - Finanzas App
              </h1>
              <p className="text-gray-600">
                Bienvenido, {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Alert>
            <AlertDescription>
              <strong>Sistema funcionando:</strong> Usuario autenticado ✅ |
              Templates cargados: {categoryTemplates.length} ✅ |
              Bancos disponibles: {banks.length} ✅
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Categorías Disponibles (Templates)</CardTitle>
              <CardDescription>
                Estas son las categorías que puedes usar. Haz clic para crear una.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.template_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span>{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                      <Badge
                        variant={template.is_created ? "default" : "secondary"}
                      >
                        {template.is_created ? "Creada" : "Disponible"}
                      </Badge>
                    </div>
                    {!template.is_created && (
                      <Button
                        size="sm"
                        onClick={() => testLazyLoading(template.name)}
                        variant="outline"
                      >
                        Crear
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mis Categorías</CardTitle>
              <CardDescription>
                Categorías que ya has creado (lazy loading funcionando)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCategories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No has creado ninguna categoría aún.<br />
                  <span className="text-sm">Haz clic en &quot;Crear&quot; en las categorías disponibles.</span>
                </p>
              ) : (
                <div className="space-y-4">
                  {userCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 border rounded-lg"
                      style={{ borderLeft: `4px solid ${category.color}` }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span>{category.icon}</span>
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge>{category.type}</Badge>
                      </div>
                      {category.subcategories.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>Subcategorías:</strong>{' '}
                          {category.subcategories.map(sub => sub.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bancos Disponibles</CardTitle>
              <CardDescription>
                Sistema de bancos funcionando correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {banks.slice(0, 12).map((bank) => (
                  <div
                    key={bank.id}
                    className="p-3 border rounded-lg text-center"
                  >
                    <div className="font-medium text-sm">{bank.name}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {bank.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {banks.length > 12 && (
                  <div className="p-3 border rounded-lg text-center text-gray-500">
                    +{banks.length - 12} más...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <FloatingActionButton />
      </main>
    </div>
  )
}