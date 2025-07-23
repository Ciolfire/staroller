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
    $result = [
      'success' => 's',
      'failure' => 'f',
      'advantage' => 'a',
      'threat' => 't',
      'triumph' => 'x',
      'despair' => 'y',
      'light' => 'z',
      'dark' => 'Z',
    ];
    $dice = [
      'boost' => [
        'max' => 9,
        'points' => "25,25 75,25 75,75 25,75",
        'faces' => [
          1 => [],
          2 => [],
          3 => [ 'advantage' => 1 ],
          4 => [ 'success' => 1 ],
          5 => [ 'advantage' => 2 ],
          6 => [ 'success' => 1, 'advantage' => 1 ],
        ],
      ],
      'ability' => [
        'max' => 7,
        'points' => "50,15 75,50 50,85 25,50",
        'faces' => [
        1 => [],
        2 => [ 'advantage' => 1 ],
        3 => [ 'advantage' => 1 ],
        4 => [ 'success' => 1 ],
        5 => [ 'success' => 1 ],
        6 => [ 'advantage' => 2 ],
        7 => [ 'success' => 1, 'advantage' => 1 ],
        8 => [ 'success' => 2 ],
        ],
      ],
      'proficiency' => [
        'max' => 9,
        'points' => "36,25 66,25 81,51 66,77 36,77 21,51",
        'faces' => [
          1 => [],
          2 => [ 'advantage' =>  1 ], 
          3 => [ 'success' =>  1 ], 
          4 => [ 'success' =>  1 ], 
          5 => [ 'advantage' =>  2 ], 
          6 => [ 'advantage' =>  2 ], 
          7 => [ 'success' =>  1, 'advantage' =>  1 ], 
          8 => [ 'success' =>  1, 'advantage' =>  1 ], 
          9 => [ 'success' =>  1, 'advantage' =>  1 ], 
          10 => [ 'success' =>  2 ], 
          11 => [ 'success' =>  2 ], 
          12 => [ 'success' =>  1, 'triumph' =>  1 ],
        ],
      ],
      'setback' => [
        'max' => 9,
        'points' => "25,25 75,25 75,75 25,75",
        'faces' => [
          1 => [], 
          2 => [], 
          3 => [ 'advantage' => -1 ], 
          4 => [ 'advantage' => -1 ], 
          5 => [ 'success' => -1 ], 
          6 => [ 'success' => -1 ],
        ],
      ],
      'difficulty' => [
        'max' => 7,
        'points' => "50,15 75,50 50,85 25,50",
        'faces' => [
          1 =>  [],
          2 =>  [ 'advantage' => -1 ],
          3 =>  [ 'advantage' => -1 ],
          4 =>  [ 'advantage' => -1 ],
          5 =>  [ 'success' => -1 ],
          6 =>  [ 'advantage' => -2 ],
          7 =>  [ 'success' => -1, 'advantage' => -1 ],
          8 =>  [ 'success' => -2 ],
        ],
      ],
      'challenge' => [
        'max' => 9,
        'points' => "36,25 66,25 81,51 66,77 36,77 21,51",
        'faces' => [
          1 => [],
          2 => [ 'advantage' => -1 ],
          3 => [ 'advantage' => -1 ],
          4 => [ 'success' => -1 ],
          5 => [ 'success' => -1 ],
          6 => [ 'advantage' => -2 ],
          7 => [ 'advantage' => -2 ],
          8 => [ 'success' => -1, 'advantage' => -1 ],
          9 => [ 'success' => -1, 'advantage' => -1 ],
          10 => [ 'success' => -2 ],
          11 => [ 'success' => -2 ],
          12 => [ 'success' => -1, 'despair' => 1 ],
        ],
      ],
      'force' => [
        'max' => 9,
        'points' => "36,25 66,25 81,51 66,77 36,77 21,51",
        'faces' => [
          1 => [ 'dark' => 1],
          2 => [ 'dark' => 1],
          3 => [ 'dark' => 1],
          4 => [ 'dark' => 1],
          5 => [ 'dark' => 1],
          6 => [ 'dark' => 1],
          7 => [ 'dark' => 2],
          8 => [ 'dark' => 1],
          9 => [ 'dark' => 1],
          10 => [ 'light' => 2],
          11 => [ 'light' => 2],
          12 => [ 'light' => 2],
        ],
      ],
    ];

    return $this->render('roller/index.html.twig', [
      'controller_name' => 'RollerController',
      'result' => $result,
      'dice' => $dice,
      'player' => 'endor',
      'enemy' => 'troopers',
    ]);
  }
}
