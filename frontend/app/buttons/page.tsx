import { Button } from "@/components/ui/button";

const ButtonsPage =() => {
    return (
      <div className="p-4 space-y-4 flex flex-col max-w-[200px]">
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="primary-outline">Primary Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary-outline">Secondary Outline</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="danger-outline">Danger Outline</Button>
        <Button variant="super">Super</Button>
        <Button variant="super-outline">Super Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="sidebar">Sidebar</Button>
        <Button variant="sidebar-outline">Sidebar Outline</Button>
      </div>   
    );
};

export default ButtonsPage;