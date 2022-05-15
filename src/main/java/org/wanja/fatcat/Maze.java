package org.wanja.fatcat;

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
  public int catX = 0;
  public int catY = 0;

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

        if( c == ' ') mazeData[y][x] = 0;
        else if ( c== '#') mazeData[y][x] = 10;
        else if ( c== 'm') {
          c = ' ';
          mouseX = x;
          mouseY = y;
          mazeData[y][x] = 0;
        }
        else if (c == 'c') {
          c = ' ';
          catX = x;
          catY = y;
          mazeData[y][x] = 0;
        }

        logicData[y][x] = c != ' ';
      }
    }
  }
  
}
