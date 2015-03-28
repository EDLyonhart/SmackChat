# http://www.codewars.com/kata/5436fdf34e3d6cb156000350/solutions/ruby


class Card

  def initialize(suit, rank)
    @suit = suit
    @rank = rank
  end

  def face_card?
    @rank > 10
  end

  def to_s
    
  end

end


class Deck

  def shuffle
    #deck.shuffle
  end

  def draw(n = 1)
    #deck.pop
  end

  def count
    #deck.length + 1
  end

end