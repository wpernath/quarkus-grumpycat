package org.wanja.fatcat;

import java.util.ArrayList;
import java.util.List;

public class Maze {
  public String name;
  public String description;
  public String author;
  public String tileSet;
  public int width;
  public int height;
  
  public int[][] mazeData;
  public boolean[][] logicData;

  public int mouseX = 0;
  public int mouseY = 0;

  public List<Cat> enemies = new ArrayList<Cat>();

  public Maze(String name, String author, int width, int height) {
    this.name = name;
    this.author = author;
    this.width = width;
    this.height = height;
  }

  public void parseMap(String mapData) {
    String[] rows = mapData.split("\\n");
    int h = rows.length;
    if( h != height) throw new IllegalArgumentException();

    mazeData  = new int[height][width];
    logicData = new boolean[height][width];

    for( int y = 0; y<h; y++) {
      String row = rows[y];
      if( row.length() != width ) throw new IllegalArgumentException();

      for( int x = 0; x < width; x++) {
        char c = row.charAt(x);
        boolean walkable = false;

        // walkable tiles
        if( c == ' ') mazeData[y][x] = 0;
        else if( c== '.' ) mazeData[y][x] = 1;
        else if( c== '_' ) mazeData[y][x] = 2;

        // non-walkable tiles
        else if ( c== '#') mazeData[y][x] = 10;
        else if( c== '[') mazeData[y][x] = 11;
        else if( c== ']') mazeData[y][x] = 12;
        else if( c== '|') mazeData[y][x] = 13;

        // player
        else if ( c== 'm') {
          c = ' ';
          mouseX = x;
          mouseY = y;
          mazeData[y][x] = 0;
        }

        // enemies
        else if (c == 'c') {
          c = ' ';
          enemies.add(new Cat(x, y));
          mazeData[y][x] = 0;
        }
        else if ( c == 'C') {
          c = ' ';
          Cat cat = new Cat(x, y);
          cat.speed = 2;
          enemies.add(cat);
          mazeData[y][x] = 0;
        }

        //logicData[y][x] = c != ' ';
        // true if tile at pos is NON walkable
        logicData[y][x] = mazeData[y][x] >= 10;
      }
    }
  }
  
}
