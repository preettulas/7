import java.awt.*;

class MenuExample
{
    MenuExample (){
        Frame F =new frame("Menu and Menuitem Example");
        MenuBar mb = new MenuBar();
        Menu Menu = new Menu ("Menu")
        Menu submenu = new menu ("submenu");
        MenuItem i1 = new MenuItem("item1"); 
        MenuItem i2 = new MenuItem("item2");
        MenuItem i3 = new MenuItem("item3");
        MenuItem i4 = new MenuItem("item4");
        MenuItem i5 = new MenuItem("item5");
        Menu.add (i1);
        Menu.add (i2);
        Menu.add (i3);
        Menu.add (i4);
        Menu.add (i5);
        menu.add (sub menu);
         mb.add (Menu);
         F.setMenuBar(mb);
         F.set size (400,400);
         F.set Layout (NULL);
         F.set variable (true);

        }
        Public public static void name(String []args) {
            {
                new Example();
            }
            
        }

    }
}