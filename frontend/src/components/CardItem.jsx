import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

export default function CardItem({ card, onClick, isDragging = false }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging: isSorting } =
    useSortable({
      id: card.id,
      data: { type: 'card', card },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting ? 0.4 : 1,
  };

  const completedItems = card.checklistItems?.filter((i) => i.completed).length || 0;
  const totalItems = card.checklistItems?.length || 0;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isSorting && onClick(card)}
      className={`bg-[#22272B] hover:bg-[#2C333A] rounded-lg p-2.5 cursor-pointer group shadow-sm transition-colors ${
        isSorting ? 'cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'shadow-2xl' : ''}`}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {card.labels.map(({ label }) => (
            <span
              key={label.id}
              className="h-2 w-10 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      <p className="text-[#B6C2CF] text-sm">{card.title}</p>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {card.dueDate && (
          <span
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
              isOverdue
                ? 'bg-red-500/20 text-red-400'
                : 'bg-[#A6C5E229] text-[#9FADBC]'
            }`}
          >
            🕐 {format(new Date(card.dueDate), 'MMM d')}
          </span>
        )}

        {totalItems > 0 && (
          <span
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
              completedItems === totalItems
                ? 'bg-green-500/20 text-green-400'
                : 'bg-[#A6C5E229] text-[#9FADBC]'
            }`}
          >
            ☑ {completedItems}/{totalItems}
          </span>
        )}

        {card.members && card.members.length > 0 && (
          <div className="flex -space-x-1 ml-auto">
            {card.members.slice(0, 3).map(({ member }) => (
              <div
                key={member.id}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold border border-[#282E33]"
                style={{ backgroundColor: member.avatar }}
                title={member.name}
              >
                {member.name[0]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
