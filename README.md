 # MediView - app for medical image annotation  <img src="/Photos-readme/logo.svg" style="width: 100px; height: 100px; margin-left: 10px; align: right;" />

## Description of a project

Project MediView was created as a part of diploma thesis under title **Browser-Based Application for Preparing Medical Image Annotations**.
App allow users to upload their own .vti files into it and make 2 kinds of addnotations:
 - Brush painting,
 - Be&#769;zier curves.

These addnotations can be made on each axis of the picture and on 3D visualization (only brush painting).

Project is created only to be used on the browser and does not need any server-side elements.

## Some views
<div style="display:flex;">
 <img src="/Photos-readme/rysowanie_zmiana_pedzla.png" style="width:30%;"/>
 <img src="/Photos-readme/odbita_krzywa.png" style="width:30%;"/>
 <img src="/Photos-readme/rysowanie_3D.png" style="width:30%;"/>
</div>

## Goal
Main goal of developing this app was organization of work with library **vtk.js**, which is part of the largest collection of visualization libraries (The Visualization Toolkit).

Library documentation do not regulate how to use it, so my plan was to create a basic usage guide of it.

Also the goal was to structurize the way of working with a library and make a proposition on how to make a vtk app from start to end.
