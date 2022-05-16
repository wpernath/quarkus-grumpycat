package org.wanja.fatcat;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import org.jboss.resteasy.annotations.jaxrs.PathParam;
@Path("/maze")
public class MazeResource {
  
  List<Maze> mazes = new ArrayList<Maze>();
  

  public MazeResource() {
    Maze m = new Maze("Level 1", "Wanja", 31, 23);
    mazes.add(m);
    m.parseMap(
        """
            ###############################
            #              m              #
            # ############# ############# #
            # #   #   #   # #   #   #   # #
            # # # # # # # # # # # # # # # #
            # # # # # # # # # # # # # # # #
            # # # # # # # # # # # # # # # #
            # # #   # # #     # # #   # # #
            # # ##### # ####### # ##### # #
            # #     # #         # #     # #
            # ##### # ##### ##### # ##### #
            #       #             #       #
            # ##### # ##### ##### # ##### #
            # #     # #         # #     # #
            # # ##### # ####### # ##### # #
            # # #c  # # #     # # #   # # #
            # # # # # # # # # # # # # # # #
            # # # # # # # # # # # # # # # #
            # # # # # # # # # # # # # # # #
            # #   #   #   # #   #   #  c# #
            # ############# ############# #
            #                             #
            ###############################"""      
    );

    m = new Maze("Level 2", "Wanja", 31, 23);
    mazes.add(m);
    m.parseMap(
        """
            ###############################
            #              m              #
            #              #              #
            #              #              #
            #  #########################  #
            #                             #
            #       # #####  #### #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            #       #             #       #
            # #######     ##      ####### #
            #                             #
            #                             #
            # #######              # ######
            #       #              #      #
            #       #              #      #
            #      c#              #     c#
            ###############################""");

  }

  @GET
  @Path("{id}")
  public Maze mazeById( @PathParam Long id) {
    return mazes.get(id.intValue());
  }

  @GET
  public int numLevels() {
    return mazes.size();
  }
}
