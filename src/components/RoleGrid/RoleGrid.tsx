interface RoleGridProps {
  cards: React.ReactNode[];
}

const RoleGrid: React.FC<RoleGridProps> = ({ cards }) => {
  return <div className="grid grid-cols-2 gap-4 justify-center">{cards}</div>;
};

export default RoleGrid;
