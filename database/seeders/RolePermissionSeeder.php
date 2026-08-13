<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            ['key' => 'gerer_utilisateurs', 'label' => 'Gerer les utilisateurs', 'description' => 'Creer, suspendre ou supprimer un compte', 'dynamic' => true, 'defaults' => ['admin' => true, 'mentor' => false, 'intern' => false]],
            ['key' => 'voir_statistiques', 'label' => 'Voir les statistiques globales', 'description' => 'Acceder au tableau de statistiques de la plateforme', 'dynamic' => true, 'defaults' => ['admin' => true, 'mentor' => false, 'intern' => false]],
            ['key' => 'traiter_documents_admin', 'label' => 'Traiter les documents (finalisation)', 'description' => 'Televerser le document final apres validation mentor', 'dynamic' => true, 'defaults' => ['admin' => true, 'mentor' => false, 'intern' => false]],
            ['key' => 'corriger_presences', 'label' => 'Corriger les presences', 'description' => 'Modifier un pointage existant', 'dynamic' => true, 'defaults' => ['admin' => true, 'mentor' => false, 'intern' => false]],
            ['key' => 'publier_evenements', 'label' => 'Publier des evenements', 'description' => 'Creer, modifier ou supprimer une annonce', 'dynamic' => true, 'defaults' => ['admin' => true, 'mentor' => false, 'intern' => false]],
            ['key' => 'valider_documents_mentor', 'label' => 'Valider les documents', 'description' => 'Approuver ou rejeter une demande de document', 'dynamic' => true, 'defaults' => ['admin' => false, 'mentor' => true, 'intern' => false]],
            ['key' => 'valider_rapports', 'label' => 'Valider les rapports', 'description' => 'Approuver ou rejeter un rapport depose', 'dynamic' => true, 'defaults' => ['admin' => false, 'mentor' => true, 'intern' => false]],
            ['key' => 'valider_permissions', 'label' => 'Valider les demandes de permission', 'description' => 'Approuver ou rejeter une demande de conge', 'dynamic' => true, 'defaults' => ['admin' => false, 'mentor' => true, 'intern' => false]],
            ['key' => 'deposer_rapport', 'label' => 'Deposer un rapport', 'description' => 'Soumettre un rapport de stage', 'dynamic' => true, 'defaults' => ['admin' => false, 'mentor' => false, 'intern' => true]],
            ['key' => 'soumettre_permission', 'label' => 'Soumettre une demande de permission', 'description' => 'Demander un conge', 'dynamic' => true, 'defaults' => ['admin' => false, 'mentor' => false, 'intern' => true]],
            ['key' => 'voir_stagiaires', 'label' => 'Voir les stagiaires', 'description' => 'Consulter la liste et les profils (pas encore branche au backend)', 'dynamic' => false, 'defaults' => ['admin' => true, 'mentor' => true, 'intern' => false]],
            ['key' => 'messagerie_interne', 'label' => 'Messagerie interne', 'description' => 'Envoyer et recevoir des messages (toujours actif, pas de restriction technique)', 'dynamic' => false, 'defaults' => ['admin' => true, 'mentor' => true, 'intern' => true]],
        ];

        foreach ($catalog as $item) {
            foreach (['admin', 'mentor', 'intern'] as $role) {
                RolePermission::updateOrCreate(
                    ['role' => $role, 'permission_key' => $item['key']],
                    [
                        'id' => (string) Str::uuid(),
                        'label' => $item['label'],
                        'description' => $item['description'],
                        'enabled' => $item['defaults'][$role],
                        'is_dynamic' => $item['dynamic'],
                    ]
                );
            }
        }
    }
}