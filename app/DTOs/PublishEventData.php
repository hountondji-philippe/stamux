<?php
namespace App\DTOs;
class PublishEventData
{
    public string $author_id;
    public string $title;
    public string $content;
    public ?string $image_path;
    public string $audience;
    public bool $is_pinned;
    public function __construct(
        string $author_id,
        string $title,
        string $content,
        string $audience,
        ?string $image_path = null,
        bool $is_pinned = false
    ) {
        $this->author_id = $author_id;
        $this->title = $title;
        $this->content = $content;
        $this->image_path = $image_path;
        $this->audience = $audience;
        $this->is_pinned = $is_pinned;
    }
    public static function fromArray(array $data): self
    {
        return new self(
            author_id: $data['author_id'],
            title: $data['title'],
            content: $data['content'],
            audience: $data['audience'],
            image_path: $data['image_path'] ?? null,
            is_pinned: $data['is_pinned'] ?? false,
        );
    }
}