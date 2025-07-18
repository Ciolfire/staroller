<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class RollerController extends AbstractController
{
    #[Route('/roller', name: 'app_roller')]
    public function index(): Response
    {
        return $this->render('roller/index.html.twig', [
            'controller_name' => 'RollerController',
        ]);
    }
}
