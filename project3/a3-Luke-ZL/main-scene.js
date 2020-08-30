window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)
                         sphere1: new(Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
                         sphere2: new(Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                         sphere3: new Subdivision_Sphere(3),
                         sphere4: new Subdivision_Sphere(4),
                         sphereGrid: new Grid_Sphere(15,15)
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient: 1 } ),
            planet1:  context.get_instance( Phong_Shader ).material( Color.of( 109/255, 126/255, 161/255, 1),  {diffusivity: 1}, {specularity: 0}),
            planet2:  context.get_instance( Phong_Shader ).material( Color.of( 30/255, 92/255, 58/255, 1), {diffusivity: 0.2}, {specularity: 1} ),
            planet3:  context.get_instance( Phong_Shader ).material( Color.of( 150/255, 75/255, 0/255, 1), {diffusivity: 1}, {specularity: 1} ),
            planet4:  context.get_instance( Phong_Shader ).material( Color.of( 66/255, 121/255, 153/255, 1), {specularity: 0.9} ),
            moon:     context.get_instance( Phong_Shader ).material( Color.of( 39/255, 94/255, 74/255, 1)),
            planet5:  context.get_instance( Phong_Shader ).material( Color.of( 192/255, 196/255, 195/255, 1),  {diffusivity: 1}, {specularity: 0})
                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        let sunRadius = 2 + Math.sin(t * 0.4 * Math.PI);
        let model_transform_sun = (Mat4.identity()).times(Mat4.scale([sunRadius, sunRadius, sunRadius]));
        let RBratio = 0.5 + 0.5 * Math.sin(t * 0.4 * Math.PI);
        this.shapes.sphere4.draw(graphics_state, model_transform_sun, this.materials.sun.override({color:Color.of(RBratio, 0, 1 - RBratio, 1)}));
        
        this.lights = [new Light(Vec.of(0,0,0,1), Color.of(RBratio, 0, 1 - RBratio, 1), 10**sunRadius)];

        //planet1
        let model_transform_p1 = (Mat4.identity()).times(Mat4.rotation(t, Vec.of(0,1,0)))
                                                  .times(Mat4.translation([5,0,0]));
        this.shapes.sphere2.draw(graphics_state, model_transform_p1, this.materials.planet1);
        this.planet_1 = model_transform_p1;

        //planet2
        let model_transform_p2 = (Mat4.identity()).times(Mat4.rotation(t/1.5, Vec.of(0,1,0)))
                                                  .times(Mat4.translation([8,0,0]));
        this.shapes.sphere3.draw(graphics_state, model_transform_p2, this.materials.planet2.override({gouraud:t%2}));
        this.planet_2 = model_transform_p2;

        //planet3
        let model_transform_p3 = (Mat4.identity()).times(Mat4.rotation(t/2.0, Vec.of(0,1,0)))
                                                  .times(Mat4.translation([11,0,0]))
                                                  .times(Mat4.rotation(t/2.0, Vec.of(1,1,1)));
        this.shapes.sphere4.draw(graphics_state, model_transform_p3, this.materials.planet3);
        this.shapes.torus.draw(graphics_state, model_transform_p3.times(Mat4.scale([1,1,0.1])), this.materials.ring);
        this.planet_3 = model_transform_p3;

        //planet4
        let model_transform_p4 = (Mat4.identity()).times(Mat4.rotation(t/2.5, Vec.of(0,1,0)))
                                                  .times(Mat4.translation([14,0,0]));
        this.shapes.sphere4.draw(graphics_state, model_transform_p4, this.materials.planet4);
        this.planet_4 = model_transform_p4;

        //moon
        let model_transform_moon = model_transform_p4.times(Mat4.rotation(t, Vec.of(0,1,0)))
                                                     .times(Mat4.translation([2,0,0]));
        this.shapes.sphere1.draw(graphics_state, model_transform_moon, this.materials.moon);
        this.moon = model_transform_moon;
        
        //planet5
        let model_transform_p5 = (Mat4.identity()).times(Mat4.rotation(t/3.0, Vec.of(0,1,0)))
                                                  .times(Mat4.translation([17,0,0]));
        this.shapes.sphereGrid.draw(graphics_state, model_transform_p5, this.materials.planet5);
        this.planet_5 = model_transform_p5;

        //attached
        if (this.attached != undefined) {
          let desired = Mat4.inverse(this.attached().times( Mat4.translation([0,0,5])));
          graphics_state.camera_transform = desired.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
        }
        
        

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
        

        //this.shapes.torus2.draw( graphics_state, Mat4.identity(), this.materials.test );

      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
          center = vec4(0,0,0,1) * model_transform;
          position = vec4( object_space_pos, 1);
          gl_Position = projection_camera_transform * model_transform * position;
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
          gl_FragColor = vec4(0.588, 0.294, 0, (-0.5 + sin(25.0*distance(center, position))));
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        const circle_points = Array( rows ).fill( Vec.of( 0,0,1 ) ) //z-axis
                                           .map( (p,i,a) => 
                                           Mat4.rotation( i/(a.length-1) * Math.PI, Vec.of( 0,-1,0 ) ).times( p.to4(1) ).to3() ); //half circle

        Surface_Of_Revolution.insert_transformed_copy_into( this, [ rows, columns, circle_points ] );  

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }